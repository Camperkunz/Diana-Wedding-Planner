'use server';

import { Resend } from 'resend';
import { headers } from 'next/headers';
import { getContactPage, getSiteLayout, getSiteSettings } from '@/lib/sanity-data';

let resendClient: Resend | null = null;

function getResend(): Resend {
    resendClient ??= new Resend(process.env.RESEND_API_KEY);
    return resendClient;
}

interface SendEmailParams {
    formData: Record<string, string>;
}

// ── Security hardening ─────────────────────────────────────────────────────
// 1. The recipient is resolved SERVER-SIDE from Sanity. It is never taken from
//    the request, so nobody can turn this action into an open email relay.
// 2. Every value interpolated into the HTML email is escaped.
// 3. replyTo must be a syntactically valid email or it is dropped.
// 4. Best-effort in-memory rate limiting per client IP. NOTE: this resets on
//    cold starts and is per-instance — it raises the bar against spam but does
//    not replace Turnstile/WAF.
// 5. The client IP is read from headers Cloudflare controls
//    (`cf-connecting-ip`, else the LAST `x-forwarded-for` hop, else `x-real-ip`).
// 6. Duplicate submissions carry a deterministic Resend idempotency key.
// 7. Cloudflare Turnstile is verified with `siteverify` on the server, with
//    action and hostname checks. The check is STRICTLY FAIL-CLOSED:
//    a missing secret, a missing TURNSTILE_HOSTNAMES, a malformed token,
//    a Cloudflare rejection, a timeout, or an action/hostname mismatch all
//    return `false`. There is no development bypass and no "always success"
//    secret — production and local behave identically.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FIELDS = 30;
const MAX_LABEL_LENGTH = 200;
const MAX_VALUE_LENGTH = 2000;
const MAX_TOTAL_LENGTH = 10000;
/** A human needs longer than this to fill the form; faster submissions are bots. */
const MIN_FILL_TIME_MS = 3000;
/** Label of the render-time stamp the form sends; never emailed. */
const TIMESTAMP_FIELD = '_hp_ts';
/** Label of the Cloudflare Turnstile token. Must match the widget field name. */
const TURNSTILE_FIELD = 'cf-turnstile-response';
/** Bot-check bookkeeping — read by the action and never echoed into the email. */
const INTERNAL_FIELDS = new Set([TIMESTAMP_FIELD, '_hp_website', TURNSTILE_FIELD]);

/** Upper bound on tracked rate-limit buckets. */
const MAX_TRACKED_KEYS = 10000;
/** Window used to collapse duplicate submissions into a single delivered mail. */
const IDEMPOTENCY_BUCKET_MS = 60 * 1000;

/**
 * The `action` value the Turnstile widget must be created with (client-side
 * `options={{ action: 'contact' }}`). Cloudflare echoes it back in the
 * siteverify response; a token minted for a different form is rejected here.
 */
const EXPECTED_TURNSTILE_ACTION = 'contact';

/**
 * Hostnames the widget is allowed to run on. Parsed from
 * TURNSTILE_HOSTNAMES (comma-separated). Required — the check fails closed
 * when this is empty, so a misconfiguration cannot silently disable it.
 */
const EXPECTED_TURNSTILE_HOSTNAMES = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? '')
        .split(',')
        .map((h) => h.trim())
        .filter(Boolean)
);

/** Cloudflare documents a hard maximum of 2048 characters for a token. */
const TURNSTILE_TOKEN_MAX_LENGTH = 2048;
/** Hard cap on the verification round-trip; a stalled fetch must not hang. */
const TURNSTILE_VERIFY_TIMEOUT_MS = 5000;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const attemptLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const recent = attemptLog.get(key);
    if (!recent) return false;
    return recent.filter((t) => now - t < RATE_LIMIT_WINDOW_MS).length >= RATE_LIMIT_MAX_ATTEMPTS;
}

function recordAttempt(key: string): void {
    const now = Date.now();
    const recent = (attemptLog.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    attemptLog.delete(key);
    attemptLog.set(key, recent);

    if (attemptLog.size <= MAX_TRACKED_KEYS) return;

    for (const [trackedKey, timestamps] of attemptLog) {
        if (timestamps.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) attemptLog.delete(trackedKey);
    }
    while (attemptLog.size > MAX_TRACKED_KEYS) {
        const oldest = attemptLog.keys().next();
        if (oldest.done || oldest.value === key) break;
        attemptLog.delete(oldest.value);
    }
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeText(value: unknown, maxLength: number): string {
    if (typeof value !== 'string') return '';
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, maxLength).trim();
}

type HeaderStore = Awaited<ReturnType<typeof headers>>;

function resolveClientIp(headerStore: HeaderStore): string | null {
    const connectingIp = headerStore.get('cf-connecting-ip')?.trim();
    if (connectingIp) return connectingIp;

    const forwardedFor = headerStore.get('x-forwarded-for');
    if (forwardedFor) {
        const lastHop = forwardedFor.split(',').pop()?.trim();
        if (lastHop) return lastHop;
    }

    return headerStore.get('x-real-ip')?.trim() || null;
}

function rateLimitKey(headerStore: HeaderStore): string {
    const ip = resolveClientIp(headerStore);
    if (ip) return `ip:${ip}`;

    const userAgent = headerStore.get('user-agent')?.trim();
    if (userAgent) {
        console.warn('Contact form: no client IP header found — falling back to a user-agent bucket.');
        return `ua:${hashString(userAgent)}`;
    }

    console.warn('Contact form: neither a client IP nor a user-agent header was present.');
    return 'anonymous';
}

function hashString(value: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16);
}

async function sha256Hex(value: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

interface TurnstileVerifyResponse {
    success: boolean;
    action?: string;
    hostname?: string;
    'error-codes'?: string[];
}

/**
 * Verifies a Turnstile token with Cloudflare. Strictly fail-closed:
 *   - missing `TURNSTILE_SECRET_KEY`    → false
 *   - missing `TURNSTILE_HOSTNAMES`     → false
 *   - empty or oversized token          → false
 *   - `siteverify` returns success=false→ false
 *   - action mismatch                   → false
 *   - hostname mismatch                 → false
 *   - network error, timeout, bad JSON  → false
 *
 * There is no development bypass and no "always-success" test secret.
 */
async function verifyTurnstile(token: string, clientIp: string | null): Promise<boolean> {
    if (!token) return false;
    if (token.length > TURNSTILE_TOKEN_MAX_LENGTH) {
        console.warn('Contact form: Turnstile token exceeds the 2048-character limit.');
        return false;
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        console.error('Contact form: TURNSTILE_SECRET_KEY is not configured — rejecting.');
        return false;
    }

    if (EXPECTED_TURNSTILE_HOSTNAMES.size === 0) {
        console.error('Contact form: TURNSTILE_HOSTNAMES is not configured — rejecting.');
        return false;
    }

    try {
        const body = new URLSearchParams({ secret, response: token });
        if (clientIp) body.set('remoteip', clientIp);

        const response = await fetch(TURNSTILE_VERIFY_URL, {
            method: 'POST',
            body,
            signal: AbortSignal.timeout(TURNSTILE_VERIFY_TIMEOUT_MS),
        });

        if (!response.ok) {
            console.error(`Contact form: Turnstile verification returned HTTP ${response.status}.`);
            return false;
        }

        const result = (await response.json()) as TurnstileVerifyResponse;

        if (result.success !== true) {
            console.warn(
                `Contact form: Turnstile rejected the token — ${result['error-codes']?.join(', ') || 'unknown error'
                }`
            );
            return false;
        }

        // Token is valid, but it must have been minted for THIS form.
        if (result.action !== EXPECTED_TURNSTILE_ACTION) {
            console.warn(
                `Contact form: Turnstile action mismatch (expected "${EXPECTED_TURNSTILE_ACTION}", got "${result.action ?? 'none'}").`
            );
            return false;
        }

        // Token must have been issued for one of our configured hostnames.
        if (!result.hostname || !EXPECTED_TURNSTILE_HOSTNAMES.has(result.hostname)) {
            console.warn(
                `Contact form: Turnstile hostname mismatch (got "${result.hostname ?? 'none'}").`
            );
            return false;
        }

        return true;
    } catch (err) {
        // Timeouts, network failures, and malformed JSON all fail closed.
        console.error('Contact form: Turnstile verification failed:', err);
        return false;
    }
}

/** Generic error shown to visitors — details are only logged on the server. */
const GENERIC_ERROR = 'Failed to send message. Please try again later.';

export async function sendEmailAction({ formData }: SendEmailParams) {
    try {
        const headerStore = await headers();

        // ── 1. Honeypot (free, no state touched) ────────────────────────────
        const honeypot =
            typeof formData?.['_hp_website'] === 'string' ? formData['_hp_website'].trim() : '';
        if (honeypot) {
            return { success: true }; // silently drop bots
        }

        // ── 2. Time trap ────────────────────────────────────────────────────
        const renderedAt = Number(formData?.[TIMESTAMP_FIELD]);
        const elapsed = Date.now() - renderedAt;
        if (!Number.isFinite(renderedAt) || elapsed < MIN_FILL_TIME_MS) {
            return { success: true }; // silently drop
        }

        // ── 3. Cloudflare Turnstile (server-side siteverify, fail-closed) ───
        const turnstileToken =
            typeof formData?.[TURNSTILE_FIELD] === 'string' ? formData[TURNSTILE_FIELD].trim() : '';
        if (!(await verifyTurnstile(turnstileToken, resolveClientIp(headerStore)))) {
            return {
                success: false,
                error: 'Security check failed. Please reload the page and try again.',
            };
        }

        // ── 4. Rate-limit pre-check (read-only) ──────────────────────────────
        const limiterKey = rateLimitKey(headerStore);
        if (isRateLimited(limiterKey)) {
            return { success: false, error: 'Too many messages sent. Please try again later.' };
        }

        // ── 5. Resolve recipient server-side ────────────────────────────────
        const [page, settings, layout] = await Promise.all([
            getContactPage(),
            getSiteSettings(),
            getSiteLayout(),
        ]);
        const targetEmail =
            sanitizeText(page?.recipientEmail, 320) ||
            sanitizeText(settings?.email, 320) ||
            sanitizeText(layout?.footerEmail, 320) ||
            sanitizeText(process.env.RESEND_FALLBACK_EMAIL, 320);

        if (!EMAIL_RE.test(targetEmail)) {
            console.error('Contact form: no valid recipient email configured in Sanity or env.');
            return { success: false, error: GENERIC_ERROR };
        }

        const FROM_ADDRESS = sanitizeText(process.env.RESEND_FROM_ADDRESS, 320);
        if (!FROM_ADDRESS) {
            console.error('Contact form: RESEND_FROM_ADDRESS is not configured.');
            return { success: false, error: GENERIC_ERROR };
        }

        // ── 6. Sanitise and bound submitted fields ──────────────────────────
        const source: Record<string, string> = formData || {};
        const entries: [string, string][] = [];
        let totalLength = 0;
        let scanned = 0;

        for (const rawLabel in source) {
            if (++scanned > MAX_FIELDS) break;
            if (!Object.prototype.hasOwnProperty.call(source, rawLabel)) continue;
            if (INTERNAL_FIELDS.has(rawLabel)) continue; // never email bot-check fields

            const label = sanitizeText(rawLabel, MAX_LABEL_LENGTH);
            const value = sanitizeText(source[rawLabel], MAX_VALUE_LENGTH);
            if (!label) continue;

            totalLength += label.length + value.length;
            if (totalLength > MAX_TOTAL_LENGTH) break;
            entries.push([label, value]);
        }

        // ── 7. replyTo / subject ────────────────────────────────────────────
        const looksLikeEmailLabel = ([label]: [string, string]) => {
            const lower = label.toLowerCase();
            return lower.includes('email') || lower.includes('mail') || lower.includes('почта');
        };
        const holdsEmailAddress = ([, value]: [string, string]) => EMAIL_RE.test(value);

        const replyTo = (
            entries.find((e) => looksLikeEmailLabel(e) && holdsEmailAddress(e)) ??
            entries.find(holdsEmailAddress)
        )?.[1];

        const nameEntry = entries.find(
            ([label]) => label.toLowerCase() === 'name' || label.toLowerCase() === 'your name'
        );
        const subjectName = (nameEntry?.[1] || 'Website').replace(/[\r\n]+/g, ' ').slice(0, 200);

        const formattedFields = entries
            .map(
                ([label, value]) =>
                    `<p style="margin: 6px 0;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value) || 'N/A'
                    }</p>`
            )
            .join('');

        const textFields = entries.map(([label, value]) => `${label}: ${value || 'N/A'}`).join('\n');

        // ── 8. Deterministic idempotency key ────────────────────────────────
        const idempotencyKey = `contact-${await sha256Hex(
            [
                limiterKey,
                String(Math.floor(Date.now() / IDEMPOTENCY_BUCKET_MS)),
                targetEmail,
                subjectName,
                ...entries.map(([label, value]) => `${label}=${value}`),
            ].join('\u0000')
        )}`;

        // ── 9. Record the attempt only when the mail is about to leave ──────
        recordAttempt(limiterKey);

        // ── 10. Send via Resend ─────────────────────────────────────────────
        const { error } = await getResend().emails.send(
            {
                from: FROM_ADDRESS,
                to: [targetEmail],
                ...(replyTo ? { replyTo } : {}),
                subject: `New Inquiry from ${subjectName}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
                        <h2>New Contact Inquiry</h2>
                        <p style="color: #666; font-size: 13px;">Target recipient: ${escapeHtml(targetEmail)}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
                        <div>${formattedFields}</div>
                    </div>
                `,
                text: `New Contact Inquiry\n\nTarget recipient: ${targetEmail}\n\n${textFields}\n`,
            },
            { idempotencyKey }
        );

        if (error) {
            const statusCode =
                typeof error.statusCode === 'number' ? ` (HTTP ${error.statusCode})` : '';
            console.error(
                `Contact form: Resend rejected the message — ${error.name}${statusCode}: ${error.message}`
            );
            if (error.name === 'validation_error' || error.name === 'invalid_from_address') {
                console.error(
                    'Contact form: check RESEND_FROM_ADDRESS — the sender domain must be verified in Resend.'
                );
            }
            return { success: false, error: GENERIC_ERROR };
        }

        return { success: true };
    } catch (err) {
        console.error('Server Action Error:', err instanceof Error ? `${err.name}: ${err.message}` : 'unknown');
        return { success: false, error: GENERIC_ERROR };
    }
}
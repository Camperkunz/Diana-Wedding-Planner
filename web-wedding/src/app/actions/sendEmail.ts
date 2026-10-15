'use server';

import { Resend } from 'resend';
import { headers } from 'next/headers';
import { getContactPage, getSiteLayout, getSiteSettings } from '@/lib/sanity-data';

// The Resend client is created on first use, not at module scope. `process.env`
// is only guaranteed to be populated while the Worker is handling a request, and
// the Resend constructor throws when the API key is missing — so building the
// client during a cold start would break the contact form.
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
// 2. Every value interpolated into the HTML email is escaped (no HTML/script
//    injection into the message body).
// 3. replyTo must be a syntactically valid email or it is dropped.
// 4. Best-effort in-memory rate limiting per client IP. NOTE: this resets on
//    cold starts and is per-instance — it raises the bar against spam but does
//    not replace a CAPTCHA/WAF if abuse ever becomes a problem.
// 5. The client IP is read from headers Cloudflare controls
//    (`cf-connecting-ip`, else the LAST `x-forwarded-for` hop, else
//    `x-real-ip`). The FIRST `x-forwarded-for` entry is visitor-supplied and
//    must never be trusted for throttling.
// 6. Duplicate submissions (double-click, network retry) carry a deterministic
//    Resend idempotency key, so one enquiry cannot be delivered twice.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FIELDS = 30;
const MAX_LABEL_LENGTH = 200;
const MAX_VALUE_LENGTH = 2000;
const MAX_TOTAL_LENGTH = 10000;

/** Upper bound on tracked rate-limit buckets (per IP, or per user-agent hash). */
const MAX_TRACKED_KEYS = 10000;
/** Window used to collapse duplicate submissions into a single delivered mail. */
const IDEMPOTENCY_BUCKET_MS = 60 * 1000;

const attemptLog = new Map<string, number[]>();

/**
 * Read-only check: has this bucket already spent its attempts inside the
 * window? Nothing is recorded here, so a caller can be rejected without
 * consuming quota — bot traps and validation failures stay free.
 */
function isRateLimited(key: string): boolean {
    const now = Date.now();
    const recent = attemptLog.get(key);
    if (!recent) return false;
    return recent.filter((t) => now - t < RATE_LIMIT_WINDOW_MS).length >= RATE_LIMIT_MAX_ATTEMPTS;
}

/**
 * Counts one attempt. Only called when a submission is actually about to be
 * handed to Resend. When the log outgrows its bound the expired buckets are
 * dropped and — only if that frees nothing — the oldest buckets are evicted
 * (the current one is never evicted), so a burst of unique keys from an
 * attacker cannot reset the limits of unrelated visitors. The previous code
 * called `clear()` here, which did exactly that.
 */
function recordAttempt(key: string): void {
    const now = Date.now();
    const recent = (attemptLog.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    recent.push(now);
    attemptLog.delete(key); // re-insert so eviction order follows recency
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

/** Escapes a value for safe interpolation into the HTML email body. */
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Strips control characters and caps the length of untrusted text. */
function sanitizeText(value: unknown, maxLength: number): string {
    if (typeof value !== 'string') return '';
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, maxLength).trim();
}

type HeaderStore = Awaited<ReturnType<typeof headers>>;

/**
 * Resolves the caller IP from headers written by Cloudflare. `cf-connecting-ip`
 * is set at the edge and cannot be chosen by the visitor; when it is missing
 * (e.g. a local `next dev` run) the LAST `x-forwarded-for` hop is used, because
 * Cloudflare appends the real address there — everything before it is
 * visitor-supplied, which is why the old `split(',')[0]` was spoofable.
 */
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

/**
 * Bucket key for the rate limiter. A caller without a usable IP would otherwise
 * share one global bucket and lock out unrelated visitors, so the user-agent is
 * hashed as a fallback; the final fallback is deliberately a single shared
 * bucket (unreachable behind Cloudflare, where an IP header is always present).
 */
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

/** FNV-1a — small, dependency-free digest used only to build bucket names. */
function hashString(value: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16);
}

/** SHA-256 as hex. WebCrypto is available in both the Workers and Node runtimes. */
async function sha256Hex(value: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Generic error shown to visitors — details are only logged on the server. */
const GENERIC_ERROR = 'Failed to send message. Please try again later.';

export async function sendEmailAction({ formData }: SendEmailParams) {
    try {
        const headerStore = await headers();

        // Honeypot: `_hp_website` is a visually hidden field in the form that
        // people never see or fill. Bots that auto-complete every input report
        // "success" but the message is dropped before anything is sent. The trap
        // is checked first and touches no state, so bot traffic cannot consume
        // the rate-limit budget of real visitors.
        const honeypot =
            typeof formData?.['_hp_website'] === 'string' ? formData['_hp_website'].trim() : '';
        if (honeypot) {
            return { success: true };
        }

        // Check-only pass: the attempt itself is recorded later, right before the
        // send, so rejected or mis-configured requests never burn a visitor's
        // quota. The bucket is keyed on a Cloudflare-supplied header, not on the
        // visitor-controlled first `x-forwarded-for` entry.
        const limiterKey = rateLimitKey(headerStore);
        if (isRateLimited(limiterKey)) {
            return { success: false, error: 'Too many messages sent. Please try again later.' };
        }

        // Recipient comes from the CMS, never from the client payload.
        const [page, settings, layout] = await Promise.all([
            getContactPage(),
            getSiteSettings(),
            getSiteLayout(),
        ]);
        const targetEmail =
            sanitizeText(page?.recipientEmail, 320) ||
            sanitizeText(settings?.email, 320) ||
            sanitizeText(layout?.footerEmail, 320) ||
            // Env is server-side and trusted, so it is a safe last-resort fallback
            // (it replaces the old client-supplied fallback).
            sanitizeText(process.env.RESEND_FALLBACK_EMAIL, 320);

        if (!EMAIL_RE.test(targetEmail)) {
            console.error('Contact form: no valid recipient email configured in Sanity or env.');
            return { success: false, error: GENERIC_ERROR };
        }

        // Sender comes from env only. There is deliberately no fallback: a hardcoded
        // test sender would silently make production mail undeliverable.
        const FROM_ADDRESS = sanitizeText(process.env.RESEND_FROM_ADDRESS, 320);
        if (!FROM_ADDRESS) {
            console.error('Contact form: RESEND_FROM_ADDRESS is not configured.');
            return { success: false, error: GENERIC_ERROR };
        }

        // Sanitised, bounded copy of the submitted fields. The scan walks the
        // payload lazily and stops at MAX_FIELDS: `Object.entries(...).slice()`
        // materialised every attacker-supplied key before throwing the extras
        // away.
        const source: Record<string, string> = formData || {};
        const entries: [string, string][] = [];
        let totalLength = 0;
        let scanned = 0;
        for (const rawLabel in source) {
            if (++scanned > MAX_FIELDS) break;
            if (!Object.prototype.hasOwnProperty.call(source, rawLabel)) continue;
            const label = sanitizeText(rawLabel, MAX_LABEL_LENGTH);
            const value = sanitizeText(source[rawLabel], MAX_VALUE_LENGTH);
            if (!label) continue;
            totalLength += label.length + value.length;
            if (totalLength > MAX_TOTAL_LENGTH) break;
            entries.push([label, value]);
        }

        // replyTo: the first field that both looks like an email field and holds
        // a valid address; failing that, the first valid address anywhere in the
        // form. Matching on the label alone silently dropped reply-to whenever
        // that one field was empty or mistyped.
        const looksLikeEmailLabel = ([label]: [string, string]) => {
            const lowerLabel = label.toLowerCase();
            return (
                lowerLabel.includes('email') ||
                lowerLabel.includes('mail') ||
                lowerLabel.includes('почта')
            );
        };
        const holdsEmailAddress = ([, value]: [string, string]) => EMAIL_RE.test(value);
        const replyTo = (
            entries.find((entry) => looksLikeEmailLabel(entry) && holdsEmailAddress(entry)) ??
            entries.find(holdsEmailAddress)
        )?.[1];

        const nameEntry = entries.find(
            ([label]) => label.toLowerCase() === 'name' || label.toLowerCase() === 'your name'
        );
        const subjectName = (nameEntry?.[1] || 'Website').replace(/[\r\n]+/g, ' ').slice(0, 200);

        const formattedFields = entries
            .map(
                ([label, value]) =>
                    `<p style="margin: 6px 0;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value) || 'N/A'}</p>`
            )
            .join('');

        // Plain-text alternative. HTML-only mail is scored worse by spam filters
        // and is unreadable in text-only clients; the SDK accepts both parts, so
        // no extra dependency is involved.
        const textFields = entries
            .map(([label, value]) => `${label}: ${value || 'N/A'}`)
            .join('\n');

        // Deterministic idempotency key: a double-click, or a retry of the same
        // submission, produces the same key and Resend drops the duplicate
        // instead of delivering twice. The minute bucket keeps a genuinely
        // repeated enquiry (sent later) deliverable.
        const idempotencyKey = `contact-${await sha256Hex(
            [
                limiterKey,
                String(Math.floor(Date.now() / IDEMPOTENCY_BUCKET_MS)),
                targetEmail,
                subjectName,
                ...entries.map(([label, value]) => `${label}=${value}`),
            ].join('\u0000')
        )}`;

        // Validation has passed and the mail is about to leave — this is the one
        // place an attempt is recorded against the rate limit.
        recordAttempt(limiterKey);

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
            // Resend reports *why* it refused (`daily_quota_exceeded`,
            // `rate_limit_exceeded`, `validation_error`, …). Logging the name
            // keeps those distinguishable instead of collapsing into one opaque
            // line; visitors keep seeing the same generic message.
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
        console.error('Server Action Error:', err);
        return { success: false, error: GENERIC_ERROR };
    }
}


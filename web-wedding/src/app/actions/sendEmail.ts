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
// 4. Best-effort in-memory rate limiting per IP. NOTE: this resets on cold
//    starts and is per-instance — it raises the bar against spam but does not
//    replace a CAPTCHA/WAF if abuse ever becomes a problem.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_FIELDS = 30;
const MAX_LABEL_LENGTH = 200;
const MAX_VALUE_LENGTH = 2000;
const MAX_TOTAL_LENGTH = 10000;

const attemptLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (attemptLog.get(key) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX_ATTEMPTS) {
        attemptLog.set(key, recent);
        return true;
    }
    recent.push(now);
    attemptLog.set(key, recent);
    // Keep the log bounded so it cannot grow forever.
    if (attemptLog.size > 10000) attemptLog.clear();
    return false;
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

/** Generic error shown to visitors — details are only logged on the server. */
const GENERIC_ERROR = 'Failed to send message. Please try again later.';

export async function sendEmailAction({ formData }: SendEmailParams) {
    try {
        const headerStore = await headers();
        const clientIp =
            headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            headerStore.get('x-real-ip') ||
            'unknown';

        if (isRateLimited(clientIp)) {
            return { success: false, error: 'Too many messages sent. Please try again later.' };
        }

        // Honeypot: `_hp_website` is a visually hidden field in the form that
        // people never see or fill. Bots that auto-complete every input report
        // "success" but the message is dropped before anything is sent.
        const honeypot =
            typeof formData?.['_hp_website'] === 'string' ? formData['_hp_website'].trim() : '';
        if (honeypot) {
            return { success: true };
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

        // Sanitised, bounded copy of the submitted fields.
        const entries: [string, string][] = [];
        let totalLength = 0;
        for (const [rawLabel, rawValue] of Object.entries(formData || {}).slice(0, MAX_FIELDS)) {
            const label = sanitizeText(rawLabel, MAX_LABEL_LENGTH);
            const value = sanitizeText(rawValue, MAX_VALUE_LENGTH);
            if (!label) continue;
            totalLength += label.length + value.length;
            if (totalLength > MAX_TOTAL_LENGTH) break;
            entries.push([label, value]);
        }

        // replyTo only if it really looks like an email address.
        const emailEntry = entries.find(([label]) => {
            const lowerKey = label.toLowerCase();
            return lowerKey.includes('email') || lowerKey.includes('mail') || lowerKey.includes('почта');
        });
        const replyTo = emailEntry && EMAIL_RE.test(emailEntry[1]) ? emailEntry[1] : undefined;

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

        const { error } = await getResend().emails.send({
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
        });

        if (error) {
            console.error('Resend API Error:', error);
            return { success: false, error: GENERIC_ERROR };
        }

        return { success: true };
    } catch (err) {
        console.error('Server Action Error:', err);
        return { success: false, error: GENERIC_ERROR };
    }
}


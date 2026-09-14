'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    recipientEmail?: string;
    formData: Record<string, string>;
}

export async function sendEmailAction({ recipientEmail, formData }: SendEmailParams) {
    try {
        // Фолбэк на случай, если поле recipientEmail в Sanity пустое —
        // на прод это трогать не придётся, но подстрахует от "no recipient" в проде
        const FALLBACK_EMAIL = process.env.RESEND_FALLBACK_EMAIL;
        const targetEmail = recipientEmail?.trim() || FALLBACK_EMAIL;

        if (!targetEmail) {
            return { success: false, error: 'No recipient email configured' };
        }

        // from теперь берётся из env, а не хардкодится
        const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || 'Contact Form <onboarding@resend.dev>';

        const emailKey = Object.keys(formData).find((key) => {
            const lowerKey = key.toLowerCase();
            return lowerKey.includes('email') || lowerKey.includes('mail') || lowerKey.includes('почта');
        });

        const userEmail = emailKey ? formData[emailKey]?.trim() : undefined;

        const formattedFields = Object.entries(formData)
            .map(([label, value]) => `<p style="margin: 6px 0;"><strong>${label}:</strong> ${value || 'N/A'}</p>`)
            .join('');

        const { data, error } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: [targetEmail], // теперь реально динамический получатель
            replyTo: userEmail,
            subject: `New Inquiry from ${formData['Name'] || formData['Your Name'] || 'Website'}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; line-height: 1.5;">
                    <h2>New Contact Inquiry</h2>
                    <p style="color: #666; font-size: 13px;">Target recipient: ${targetEmail}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
                    <div>${formattedFields}</div>
                </div>
            `,
        });

        if (error) {
            console.error('Resend API Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        console.error('Server Action Error:', err);
        return { success: false, error: err?.message || 'Failed to send message' };
    }
}
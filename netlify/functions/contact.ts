import type { Config, Context } from '@netlify/functions';

/**
 * Handles the general Contact Us form (and, via a `service` prefill in the
 * message body, puja-booking requests). Sends via Resend — set RESEND_API_KEY
 * and CONTACT_TO_EMAIL in Netlify's environment variables.
 *
 * Free tier: Resend gives 3,000 emails/month and 100/day, comfortably above
 * what a temple contact form generates.
 */
export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // Honeypot: bots fill every field, real users never see or fill this one.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return json({ ok: true }); // pretend success, drop silently
  }

  const name = clean(body.name, 200);
  const email = clean(body.email, 320);
  const phone = clean(body.phone, 60);
  const message = clean(body.message, 5000);

  if (!name || !email || !message || !isValidEmail(email)) {
    return json({ error: 'Please provide your name, a valid email, and a message.' }, 422);
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'info@shivatempleorlando.org';
  const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? 'Shiv Dham Website <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    // Not configured yet — fail loudly in logs but don't 500 the user experience
    // during early development before Resend is wired up.
    console.error('RESEND_API_KEY is not set — contact form email was not sent.');
    return json({ error: 'The contact form is not fully configured yet. Please email us directly.' }, 503);
  }

  const html = `
    <h2>New message from shivdhamhindutemple.org</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      reply_to: email,
      subject: `Website contact form — ${name}`,
      html,
    }),
  });

  if (!resendRes.ok) {
    const errText = await resendRes.text();
    console.error('Resend API error:', errText);
    return json({ error: 'Could not send message. Please try again or email us directly.' }, 502);
  }

  return json({ ok: true });
};

function clean(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config: Config = {
  path: '/.netlify/functions/contact',
};

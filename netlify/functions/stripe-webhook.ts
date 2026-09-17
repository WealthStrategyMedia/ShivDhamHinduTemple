import type { Config, Context } from '@netlify/functions';

/**
 * Receives Stripe webhook events (primarily checkout.session.completed) and
 * sends a confirmation email via Resend to both the donor/customer and the
 * temple office. NOT LIVE until STRIPE_WEBHOOK_SECRET and STRIPE_SECRET_KEY
 * are set in Netlify's environment.
 *
 * Once Stripe credentials exist, register this endpoint in the Stripe
 * Dashboard: https://dashboard.stripe.com/webhooks
 *   URL: https://<your-site>.netlify.app/.netlify/functions/stripe-webhook
 *   Events: checkout.session.completed
 */
export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? 'info@shivatempleorlando.org';
  const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? 'Shiv Dham Website <onboarding@resend.dev>';

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set — webhook cannot verify events yet.');
    return new Response('Webhook not configured', { status: 503 });
  }

  const signature = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  if (!signature || !(await verifyStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET))) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const amount = ((session.amount_total ?? 0) / 100).toFixed(2);
    const email = session.customer_details?.email ?? session.customer_email ?? 'unknown';

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: CONTACT_FROM_EMAIL,
          to: CONTACT_TO_EMAIL,
          subject: `New payment received — $${amount}`,
          html: `<p>A new Stripe payment of <strong>$${amount}</strong> was completed by <strong>${email}</strong>.</p>
                 <p>Stripe session: ${session.id}</p>`,
        }),
      });

      if (email !== 'unknown') {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: CONTACT_FROM_EMAIL,
            to: email,
            subject: 'Thank you for your gift to Shri Shiv Dham Hindu Temple',
            html: `<p>Thank you for your gift of $${amount} to Shri Shiv Dham Hindu Temple. Your support helps sustain daily worship, festivals, and community programs.</p>`,
          }),
        });
      }
    }
  }

  return new Response('ok', { status: 200 });
};

/** Verifies a Stripe webhook signature without pulling in the full Stripe SDK. */
async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]));
  const timestamp = parts.t;
  const expectedSig = parts.v1;
  if (!timestamp || !expectedSig) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const computedSig = [...new Uint8Array(signatureBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

  return computedSig === expectedSig;
}

export const config: Config = {
  path: '/.netlify/functions/stripe-webhook',
};

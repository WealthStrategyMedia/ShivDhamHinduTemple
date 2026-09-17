import type { Config, Context } from '@netlify/functions';

/**
 * Creates a Stripe Checkout Session for a donation or store purchase and
 * returns the hosted checkout URL for the browser to redirect to.
 *
 * NOT LIVE YET — the temple's Stripe account and API keys don't exist as of
 * this writing. This function is written and ready so that once STRIPE_SECRET_KEY
 * is set in Netlify's environment variables, checkout works with no code changes.
 * Until then it returns a clear 503 rather than pretending to work.
 *
 * Expected POST body:
 *   { mode: 'payment' | 'subscription',
 *     lineItems: [{ price: 'price_xxx', quantity: 1 }]  // Stripe Price IDs
 *       -- OR --
 *     amount: 5100, currency: 'usd', description: 'General Donation' } // ad-hoc amount, in cents
 */
export default async (req: Request, _context: Context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const SITE_URL = process.env.URL ?? 'https://shivdhamhindutemple.org';

  if (!STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set — Stripe checkout is not configured yet.');
    return json(
      { error: 'Online payment is not enabled yet. Please contact the temple office to complete this donation or booking.' },
      503,
    );
  }

  let body: {
    mode?: 'payment' | 'subscription';
    lineItems?: { price: string; quantity: number }[];
    amount?: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
    successPath?: string; // e.g. '/order-confirmation/' — defaults to the donation flow
    cancelPath?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const mode = body.mode === 'subscription' ? 'subscription' : 'payment';
  const successPath = body.successPath ?? '/donation-confirmation/';
  const cancelPath = body.cancelPath ?? '/donation-failed/';

  const params = new URLSearchParams();
  params.set('mode', mode);
  params.set('success_url', `${SITE_URL}${successPath}?session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${SITE_URL}${cancelPath}`);

  if (body.lineItems?.length) {
    body.lineItems.forEach((item, i) => {
      params.set(`line_items[${i}][price]`, item.price);
      params.set(`line_items[${i}][quantity]`, String(item.quantity ?? 1));
    });
  } else if (body.amount) {
    params.set('line_items[0][price_data][currency]', body.currency ?? 'usd');
    params.set('line_items[0][price_data][product_data][name]', body.description ?? 'Donation to Shri Shiv Dham Hindu Temple');
    params.set('line_items[0][price_data][unit_amount]', String(Math.round(body.amount)));
    params.set('line_items[0][quantity]', '1');
  } else {
    return json({ error: 'Provide either lineItems or an amount.' }, 422);
  }

  if (body.metadata) {
    for (const [key, value] of Object.entries(body.metadata)) {
      params.set(`metadata[${key}]`, value);
    }
  }

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const session = await stripeRes.json();

  if (!stripeRes.ok) {
    console.error('Stripe error:', session);
    return json({ error: session.error?.message ?? 'Could not start checkout.' }, 502);
  }

  return json({ url: session.url });
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const config: Config = {
  path: '/.netlify/functions/create-checkout-session',
};

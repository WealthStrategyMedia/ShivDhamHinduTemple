// On-site checkout for everything sold through the temple's Tweeble account
// (programs, services, products, memberships, fundraising goals, donations).
// A button opens a modal on THIS page containing Tweeble's own secure card
// form, so visitors pay without being sent away. Card numbers are typed into
// Stripe's protected frames inside that form: they never touch this website.
//
// Any element can start a checkout:
//
//   <button data-buy data-buy-type="program" data-buy-item="<id>"
//           data-buy-title="Yoga Classes" data-buy-fallback="<tweeble url>">
//
// The form itself is Tweeble's hosted checkout: buyers can pay as a GUEST (just
// a name and email), create a free Tweeble account, or sign in to an existing
// one, all without leaving this page, and every sale is recorded against the
// temple's Tweeble account. Only the surrounding dialog is ours.
//
// Speed: Tweeble's checkout is a full web app that can take several seconds to
// wake up. So the dialog is built (invisibly, at full size) the moment a visitor
// shows intent to buy (hover, focus or touch) and the click just reveals a form
// that is already loaded. One prepared checkout at a time; it is discarded if unused.
//
// Each item in a Tweeble feed carries its own `embedUrl` (pass it as
// `data-buy-embed`). Without one, Tweeble's documented `purchase-embed.js`
// (data-inline mode) is loaded from the item's type and id instead. The
// general donation form passes the `embedUrl` its `POST /donate` call returns.
import { TWEEBLE } from './site';

export type BuyType = 'service' | 'product' | 'program' | 'membership' | 'fundraising' | 'donation' | 'ticket' | 'course';

export interface CheckoutRequest {
  type: BuyType;
  /** The item's id from its Tweeble feed (not needed for a general donation). */
  item?: string;
  title: string;
  /** Tweeble page to fall back to if the on-site form can't load. */
  fallbackUrl?: string;
  /** Hosted checkout to show (a feed item's `embedUrl`, or a fresh donation session). */
  embedUrl?: string;
  /** Runs when the visitor closes the dialog after a completed payment. */
  onDone?: () => void;
}

const ORIGIN = 'https://www.tweeble.com';
const EMBED_SCRIPT = `${ORIGIN}/api/public/${TWEEBLE.tenantId}/purchase-embed.js`;

let active = false;

// Credits an affiliate when the visitor arrived through a ?ref= link.
const withAffiliateRef = (url: string) => {
  const ref = new URLSearchParams(location.search).get('ref');
  if (!ref || !url.includes('/embed/buy/')) return url;
  const u = new URL(url);
  u.searchParams.set('ref', ref);
  return u.href;
};

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

interface BuiltCheckout {
  key: string;
  show: () => void;
  destroy: () => void;
}

const checkoutKey = (req: CheckoutRequest) => req.embedUrl ?? `${req.type}:${req.item ?? ''}`;

/** Builds the dialog and starts loading the form, but leaves it invisible until show(). */
function buildCheckout(req: CheckoutRequest): BuiltCheckout {
  let opener: HTMLElement | null = null;
  let previousOverflow = '';

  // While warming up it is transparent (not display:none or visibility:hidden, which
  // would stop the browser painting the form) and inert, so it can't be tabbed into or clicked.
  const overlay = el('div', 'pointer-events-none fixed inset-0 opacity-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('inert', '');
  const panel = el('div', 'relative flex h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:h-auto sm:max-h-[92vh] sm:max-w-xl sm:rounded-3xl');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'checkout-title');

  // Header
  const header = el('div', 'flex items-center justify-between gap-4 border-b border-ivory-200 bg-ivory-50 px-5 py-4');
  const heading = el('div', 'flex min-w-0 items-center gap-3');
  heading.innerHTML =
    '<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marigold-100 text-maroon-600"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>';
  const titleWrap = el('div', 'min-w-0');
  titleWrap.appendChild(el('p', 'text-xs font-semibold uppercase tracking-wider text-marigold-600', 'Secure checkout'));
  const title = el('h2', 'truncate font-display text-lg font-semibold text-maroon-700', req.title);
  title.id = 'checkout-title';
  titleWrap.appendChild(title);
  heading.appendChild(titleWrap);

  const closeBtn = el('button', 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ivory-500 hover:bg-ivory-200 hover:text-maroon-700');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close checkout');
  closeBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  header.append(heading, closeBtn);

  // Success banner (shown when Tweeble reports a completed payment)
  const success = el('div', 'hidden items-center gap-3 border-b border-ivory-200 bg-marigold-50 px-5 py-3 text-sm font-medium text-maroon-700');
  success.setAttribute('role', 'status');
  success.textContent = 'Payment received. Thank you, and blessings to you and your family. 🙏';

  // Body
  const body = el('div', 'relative min-h-[24rem] flex-1 overflow-y-auto bg-white');
  const loading = el('div', 'pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white text-ivory-500');
  loading.innerHTML =
    '<span class="h-9 w-9 animate-spin rounded-full border-[3px] border-ivory-200 border-t-marigold-500"></span><span class="loading-text text-sm">Loading secure checkout…</span>';
  const mount = el('div', 'relative');
  body.append(loading, mount);

  // Footer
  const footer = el('div', 'border-t border-ivory-200 bg-ivory-50 px-5 py-3 text-center text-xs leading-relaxed text-ivory-500');
  footer.append(document.createTextNode('Card details go straight to Stripe and never touch this website.'));
  if (req.fallbackUrl) {
    footer.append(document.createTextNode(' Trouble? '));
    const fb = el('a', 'font-semibold text-maroon-700 underline decoration-marigold-300 decoration-2 underline-offset-2', 'Complete this on the Temple Hub');
    fb.setAttribute('href', req.fallbackUrl);
    fb.setAttribute('target', '_blank');
    fb.setAttribute('rel', 'noopener');
    footer.append(fb, document.createTextNode('.'));
  }

  panel.append(header, success, body, footer);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  let paid = false;
  let loadTimer: number | undefined;
  let slowTimer: number | undefined;

  const showFailure = () => {
    loading.innerHTML = '';
    loading.appendChild(el('p', 'max-w-xs px-6 text-center text-sm text-ivory-700', "We couldn't load the checkout here. Please try again, or use the link below to complete it on the Temple Hub."));
  };

  function destroy() {
    window.clearTimeout(loadTimer);
    window.clearTimeout(slowTimer);
    window.removeEventListener('message', onMessage);
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  }

  function close() {
    destroy();
    document.body.style.overflow = previousOverflow;
    active = false;
    opener?.focus?.();
    if (paid) req.onDone?.();
  }

  function show() {
    active = true;
    opener = document.activeElement as HTMLElement | null;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.removeAttribute('aria-hidden');
    overlay.removeAttribute('inert');
    document.addEventListener('keydown', onKey);
    closeBtn.focus();
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') close();
  }

  function onMessage(event: MessageEvent) {
    if (event.origin !== ORIGIN || !event.data || typeof event.data.type !== 'string') return;
    if (event.data.type === 'tweeble:purchase' || event.data.type === 'tweeble:payment_complete') {
      paid = true;
      success.classList.remove('hidden');
      success.classList.add('flex');
      closeBtn.setAttribute('aria-label', 'Done');
    }
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  window.addEventListener('message', onMessage);

  const watchIframe = () => {
    const iframe = mount.querySelector('iframe');
    if (!iframe) return false;
    // The form is a client-rendered app: it paints a moment after the frame
    // "loads", so keep the spinner up a little longer to avoid a blank flash.
    iframe.addEventListener('load', () => {
      window.clearTimeout(loadTimer);
      window.clearTimeout(slowTimer);
      window.setTimeout(() => loading.remove(), 2500);
    });
    return true;
  };

  // Tweeble's checkout occasionally takes a while to wake up, so reassure
  // first and only report a failure after a genuinely long wait.
  slowTimer = window.setTimeout(() => {
    const text = loading.querySelector('.loading-text');
    if (text) text.textContent = 'Still loading. Thanks for your patience…';
  }, 8000);
  loadTimer = window.setTimeout(showFailure, 40000);

  if (req.embedUrl) {
    const iframe = el('iframe', 'block h-[70dvh] w-full border-0 bg-white sm:h-[42rem]');
    iframe.title = 'Secure checkout';
    iframe.setAttribute('allow', 'payment *');
    iframe.src = withAffiliateRef(req.embedUrl);
    mount.appendChild(iframe);
    watchIframe();
  } else {
    const script = document.createElement('script');
    script.src = EMBED_SCRIPT;
    script.dataset.type = req.type;
    if (req.item) script.dataset.item = req.item;
    script.dataset.inline = 'true';
    const ref = new URLSearchParams(location.search).get('ref');
    if (ref) script.dataset.ref = ref;
    script.addEventListener('load', () => {
      if (!watchIframe()) showFailure();
    });
    script.addEventListener('error', showFailure);
    mount.appendChild(script);
  }

  return { key: checkoutKey(req), show, destroy };
}

let prepared: BuiltCheckout | null = null;
let preparedExpiry: number | undefined;

function discardPrepared() {
  window.clearTimeout(preparedExpiry);
  prepared?.destroy();
  prepared = null;
}

let connectionsWarmed = false;
function warmConnections() {
  if (connectionsWarmed) return;
  connectionsWarmed = true;
  for (const href of [ORIGIN, 'https://js.stripe.com']) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = '';
    document.head.appendChild(link);
  }
}

/** Starts loading a checkout in the background so a following click opens it instantly. */
export function prewarmCheckout(req: CheckoutRequest) {
  if (active) return;
  warmConnections();
  if (prepared?.key === checkoutKey(req)) return;
  discardPrepared();
  prepared = buildCheckout(req);
  // Not clicked within a minute and a half: free it (the next intent rebuilds it).
  preparedExpiry = window.setTimeout(discardPrepared, 90_000);
}

export function openCheckout(req: CheckoutRequest) {
  if (active) return;
  const key = checkoutKey(req);
  let built: BuiltCheckout;
  if (prepared?.key === key) {
    window.clearTimeout(preparedExpiry);
    built = prepared;
  } else {
    discardPrepared();
    built = buildCheckout(req);
  }
  prepared = null;
  built.show();
}

let initialized = false;

/** Wires up every `[data-buy]` element on the page, now and later (event delegation). */
export function initCheckoutButtons() {
  if (initialized) return;
  initialized = true;

  const requestFrom = (trigger: HTMLElement): CheckoutRequest | null => {
    const { buyType, buyItem, buyTitle, buyFallback, buyEmbed } = trigger.dataset;
    if (!buyType) return null;
    return {
      type: buyType as BuyType,
      item: buyItem,
      title: buyTitle ?? 'Checkout',
      fallbackUrl: buyFallback,
      embedUrl: buyEmbed || undefined,
    };
  };
  const triggerOf = (event: Event): HTMLElement | null => {
    const target = event.target;
    return target instanceof Element ? target.closest<HTMLElement>('[data-buy]') : null;
  };

  document.addEventListener('click', (event) => {
    const trigger = triggerOf(event);
    const req = trigger && requestFrom(trigger);
    if (!req) return;
    event.preventDefault();
    openCheckout(req);
  });

  // Intent: hovering (after a brief dwell, so sweeping past a long list of
  // buttons loads nothing), keyboard focus, or the start of a touch.
  let dwell: number | undefined;
  const warm = (trigger: HTMLElement) => {
    const req = requestFrom(trigger);
    if (req) prewarmCheckout(req);
  };
  document.addEventListener('pointerover', (event) => {
    if ((event as PointerEvent).pointerType === 'touch') return;
    const trigger = triggerOf(event);
    if (!trigger) return;
    window.clearTimeout(dwell);
    dwell = window.setTimeout(() => warm(trigger), 120);
  });
  document.addEventListener('pointerout', (event) => {
    if (triggerOf(event)) window.clearTimeout(dwell);
  });
  document.addEventListener('focusin', (event) => {
    const trigger = triggerOf(event);
    if (trigger) warm(trigger);
  });
  document.addEventListener(
    'touchstart',
    (event) => {
      const trigger = triggerOf(event);
      if (trigger) warm(trigger);
    },
    { passive: true },
  );
}

export const programButtonLabel = (isFree: boolean) => (isFree ? 'Sign Up Free' : 'Register & Pay');

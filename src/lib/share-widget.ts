// Shared "Share" button behavior, reused across every live Tweeble card
// (events, blog posts, services, products, membership packages, and
// fundraising goals). A card only needs one element:
//
//   <button class="share-trigger" data-share-url="..." data-share-title="...">
//
// On phones/tablets, `navigator.share()` opens the OS-native share sheet —
// which is the only real way to "share to Instagram or TikTok", since
// neither platform exposes a public web share URL the way Facebook, X, and
// WhatsApp do. Desktop browsers without that API get a small popover with
// direct links to the platforms that do support one.
const SHARE_LINKS = (url: string, title: string) => [
  {
    name: 'Facebook',
    href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12"/></svg>',
  },
  {
    name: 'X',
    href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg>',
  },
  {
    name: 'WhatsApp',
    href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2m0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .9.9-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2m4.5-6.1c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-1.4-.7-2.3-1.2-3.2-2.7-.2-.3 0-.5.2-.7.2-.2.4-.5.6-.7.1-.2.1-.4 0-.5-.1-.2-.5-1.4-.7-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1 0 1.3 1 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.8 2.1.9 2.5.7 3 .6.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.3-.2-.5-.3Z"/></svg>',
  },
  {
    name: 'Truth Social',
    href: `https://truthsocial.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12 12 4l8 8-8 8Z"/></svg>',
  },
  {
    name: 'Email',
    href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/><path d="M3.5 6.5 12 13l8.5-6.5"/></svg>',
  },
];

let popover: HTMLElement | null = null;

function closePopover() {
  popover?.remove();
  popover = null;
}

function openPopover(anchor: HTMLElement, url: string, title: string) {
  closePopover();
  const el = document.createElement('div');
  el.className = 'share-popover fixed z-[70] w-56 rounded-2xl border border-ivory-200 bg-white p-2 shadow-lift';
  el.innerHTML = SHARE_LINKS(url, title)
    .map(
      (l) =>
        `<a href="${l.href}" target="_blank" rel="noopener" class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ivory-700 hover:bg-ivory-100 hover:text-maroon-700">${l.icon}${l.name}</a>`,
    )
    .join('') +
    `<button type="button" class="copy-link-btn flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ivory-700 hover:bg-ivory-100 hover:text-maroon-700">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>
      <span class="copy-link-label">Copy Link</span>
    </button>`;

  document.body.appendChild(el);
  const rect = anchor.getBoundingClientRect();
  const top = Math.min(rect.bottom + 6, window.innerHeight - el.offsetHeight - 8);
  const left = Math.min(rect.left, window.innerWidth - el.offsetWidth - 8);
  el.style.top = `${Math.max(8, top)}px`;
  el.style.left = `${Math.max(8, left)}px`;

  el.querySelector('.copy-link-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url);
      const label = el.querySelector('.copy-link-label');
      if (label) label.textContent = 'Copied!';
      setTimeout(closePopover, 900);
    } catch {
      closePopover();
    }
  });

  popover = el;
}

let initialized = false;

export function initShareButtons() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const trigger = target.closest<HTMLElement>('.share-trigger');

    if (trigger) {
      event.preventDefault();
      event.stopPropagation();
      const url = trigger.dataset.shareUrl ?? window.location.href;
      const title = trigger.dataset.shareTitle ?? document.title;

      if (navigator.share) {
        navigator.share({ url, title }).catch(() => {});
      } else {
        openPopover(trigger, url, title);
      }
      return;
    }

    if (popover && !popover.contains(target)) closePopover();
  });

  window.addEventListener('scroll', closePopover, { passive: true });
}

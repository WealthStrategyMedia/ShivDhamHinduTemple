// Behavior for the click-to-play video posters (see components/YouTubeEmbed.astro).
// Loaded once by the layout, so it also serves the posters written directly into
// markdown pages. YouTube's player only loads when a visitor presses play.

const hideFallback = (box: Element) => box.querySelector('.yt-fallback')?.classList.add('hidden');

// A poster that fails to load is retried from YouTube's own thumbnail, and if that
// fails too the branded tile behind it (an ॐ on maroon) shows instead of a blank box.
function posterFailed(img: HTMLImageElement) {
  const box = img.closest<HTMLElement>('.yt-embed');
  if (!box) return;
  if (!img.dataset.triedRemote && box.dataset.ytId) {
    img.dataset.triedRemote = '1';
    img.src = `https://i.ytimg.com/vi/${box.dataset.ytId}/hqdefault.jpg`;
    return;
  }
  img.classList.add('hidden');
  box.querySelector('.yt-fallback')?.classList.remove('hidden');
}

// Image errors don't bubble, so listen in the capture phase.
document.addEventListener(
  'error',
  (event) => {
    if (event.target instanceof HTMLImageElement && event.target.closest('.yt-embed')) posterFailed(event.target);
  },
  true,
);

// Posters that already failed before this script ran.
document.querySelectorAll<HTMLImageElement>('.yt-embed img').forEach((img) => {
  if (img.currentSrc && img.complete && img.naturalWidth === 0) posterFailed(img);
});

// Once a poster has really loaded, the fallback tile behind it isn't needed.
document.addEventListener(
  'load',
  (event) => {
    if (event.target instanceof HTMLImageElement) {
      const box = event.target.closest('.yt-embed');
      if (box) hideFallback(box);
    }
  },
  true,
);
document.querySelectorAll<HTMLImageElement>('.yt-embed img').forEach((img) => {
  if (img.complete && img.naturalWidth > 0) hideFallback(img.closest('.yt-embed')!);
});

document.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('.yt-embed > button');
  const box = button?.parentElement;
  if (!button || !box?.dataset.ytId || button.disabled) return;
  button.disabled = true;

  // The poster stays on screen (with a spinner) until the player has loaded, so
  // there is never a black box between pressing play and the video appearing.
  const spinner = document.createElement('div');
  spinner.className = 'absolute inset-0 z-10 flex items-center justify-center bg-black/30';
  spinner.setAttribute('role', 'status');
  spinner.innerHTML =
    '<span class="h-12 w-12 animate-spin rounded-full border-4 border-white/40 border-t-marigold-400"></span><span class="sr-only">Loading video</span>';
  box.appendChild(spinner);

  const iframe = document.createElement('iframe');
  iframe.className = 'absolute inset-0 z-20 h-full w-full opacity-0 transition-opacity duration-500';
  iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.ytId}?autoplay=1&rel=0&playsinline=1`;
  iframe.title = box.dataset.ytTitle ?? 'Video';
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  iframe.addEventListener('load', () => {
    // Give YouTube's player a moment to paint its first frame before revealing it.
    window.setTimeout(() => {
      iframe.classList.remove('opacity-0');
      window.setTimeout(() => {
        button.remove();
        spinner.remove();
      }, 500);
    }, 700);
  });
  box.appendChild(iframe);
  iframe.focus();
});

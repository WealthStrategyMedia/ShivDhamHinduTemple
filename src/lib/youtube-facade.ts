// Click-to-play for YouTube thumbnails (see components/YouTubeEmbed.astro).
// Loaded once by the layout, so it also serves the video thumbnails written
// directly into markdown pages. The player itself only loads on click.
document.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('.yt-embed > button');
  const box = button?.parentElement;
  if (!button || !box?.dataset.ytId) return;

  const iframe = document.createElement('iframe');
  iframe.className = 'absolute inset-0 h-full w-full';
  iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.ytId}?autoplay=1&rel=0&playsinline=1`;
  iframe.title = box.dataset.ytTitle ?? 'Video';
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  button.replaceWith(iframe);
  iframe.focus();
});

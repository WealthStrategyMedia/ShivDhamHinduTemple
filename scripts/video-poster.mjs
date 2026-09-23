// Makes the on-site poster image for a YouTube video.
//
//   node scripts/video-poster.mjs <youtube-id> [--portrait]
//
// Downloads YouTube's largest thumbnail, crops it to the video's real shape
// (--portrait for Shorts/vertical video: YouTube pads those with blurred side
// bars, which this trims off), and saves a small WebP to
// public/video-posters/<id>.webp, plus a tiny blurred preview (a few hundred bytes) in
// src/data/video-lqip.json that pages paint instantly while the real poster loads. Serving the poster from this site means it
// shows instantly and never depends on YouTube's servers being reachable.
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const [id, flag] = process.argv.slice(2);
if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) {
  console.error('Usage: node scripts/video-poster.mjs <11-character youtube id> [--portrait]');
  process.exit(1);
}
const portrait = flag === '--portrait';

async function download() {
  for (const name of ['maxresdefault', 'sddefault', 'hqdefault']) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const { width, height } = await sharp(buf).metadata();
      // YouTube serves a tiny 120x90 grey placeholder when a size doesn't exist.
      if (width >= 480) return { buf, width, height, name };
    }
  }
  throw new Error(`No usable thumbnail found for ${id}`);
}

const { buf, width, height, name } = await download();
let image = sharp(buf);

if (portrait) {
  // The vertical video sits centred in the padded frame at 9:16 of its height.
  const cropWidth = Math.round((height * 9) / 16);
  image = image.extract({ left: Math.round((width - cropWidth) / 2), top: 0, width: cropWidth, height });
} else if (Math.abs(width / height - 16 / 9) > 0.05) {
  // hqdefault/sddefault are 4:3 with black bars top and bottom; keep the 16:9 band.
  const bandHeight = Math.round((width * 9) / 16);
  image = image.extract({ left: 0, top: Math.round((height - bandHeight) / 2), width, height: bandHeight });
}

const out = await image
  .resize(portrait ? { width: 540, height: 960, fit: 'inside', withoutEnlargement: true } : { width: 960, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer();

await mkdir('public/video-posters', { recursive: true });
await writeFile(`public/video-posters/${id}.webp`, out);

// Blurred placeholder: a ~32px copy, inlined in the page as a data URI.
const tiny = await sharp(out)
  .resize(portrait ? { height: 32 } : { width: 32 })
  .webp({ quality: 45 })
  .toBuffer();
const lqipFile = 'src/data/video-lqip.json';
const lqip = JSON.parse(await readFile(lqipFile, 'utf8').catch(() => '{}'));
lqip[id] = `data:image/webp;base64,${tiny.toString('base64')}`;
await writeFile(lqipFile, `${JSON.stringify(lqip, null, 2)}\n`);
console.log(`${id}: ${portrait ? 'portrait' : 'landscape'} poster from ${name}, ${(out.length / 1024).toFixed(0)} KB`);

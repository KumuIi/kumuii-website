// Auto-fills the media wall in index.html from whatever images live in
// public/build/assets/media/. Drop an image in that folder and it shows up.
//
// Runs automatically before every build (the "prebuild" npm hook), and you
// can run it any time with:  npm run gallery
//
// It only touches the text between the GALLERY:AUTO markers in index.html.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const mediaDir = join(root, 'public', 'build', 'assets', 'media');
const indexPath = join(root, 'index.html');

const IMG_EXT = /\.(jpe?g|png|gif|webp|avif)$/i;

// images that live in media/ but are NOT gallery pictures (used elsewhere)
const IGNORE = new Set([
  'm-miku-nendo.gif', // floating miku mascot
]);

const START = '<!-- GALLERY:AUTO:START -->';
const END = '<!-- GALLERY:AUTO:END -->';

let files;
try {
  files = readdirSync(mediaDir);
} catch (err) {
  console.error('[gen-gallery] could not read', mediaDir, '-', err.message);
  process.exit(0); // don't fail the build over the gallery
}

files = files
  .filter(f => IMG_EXT.test(f) && !IGNORE.has(f) && !f.startsWith('.'))
  .sort((a, b) => a.localeCompare(b));

const cells = files
  .map(f => `            <div class="cell"><img src="build/assets/media/${f}" alt="" loading="lazy" /></div>`)
  .join('\n');

const note = START +
  '<!-- auto-generated from public/build/assets/media/ by scripts/gen-gallery.mjs · run `npm run gallery` or it runs on build -->';

let html = readFileSync(indexPath, 'utf8');
const s = html.indexOf(START);
const e = html.indexOf(END);
if (s === -1 || e === -1) {
  console.error('[gen-gallery] GALLERY:AUTO markers not found in index.html, skipping.');
  process.exit(0);
}

html = html.slice(0, s) + note + '\n' + cells + '\n            ' + html.slice(e);
writeFileSync(indexPath, html);
console.log(`[gen-gallery] wrote ${files.length} gallery cell(s) from media/.`);

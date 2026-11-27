// Builds the self-hosted mono font from DejaVu Sans Mono (the open font Apple's Menlo is based on).
// Keeps Latin, Latin-1, Latin Extended-A and common punctuation, and writes woff2 files to src/fonts.
// Run with: npm run fonts
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const pkg = new URL('../node_modules/dejavu-fonts-ttf/', import.meta.url);
const out = new URL('../src/fonts/', import.meta.url);

const ranges = [
  [0x20, 0x7e],     // Basic Latin
  [0xa0, 0x17f],    // Latin-1 and Latin Extended-A (ū in Chūgoku, é, ñ, ...)
  [0x2010, 0x2027], // dashes, quotes, ellipsis, bullet
  [0x2032, 0x2033], // prime marks for coordinates
  [0x2190, 0x2193], // arrows
];
const text = ranges
  .flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)))
  .join('');

const faces = [
  ['DejaVuSansMono.ttf', 'dejavu-sans-mono-400.woff2'],
  ['DejaVuSansMono-Bold.ttf', 'dejavu-sans-mono-700.woff2'],
];

await mkdir(out, { recursive: true });
for (const [src, dest] of faces) {
  const font = await readFile(new URL(`ttf/${src}`, pkg));
  const woff2 = await subsetFont(font, text, { targetFormat: 'woff2' });
  await writeFile(new URL(dest, out), woff2);
  console.log(`${dest}: ${(woff2.length / 1024).toFixed(1)} KB`);
}
await copyFile(new URL('LICENSE', pkg), new URL('DEJAVU-LICENSE.txt', out));
console.log(`License copied to ${fileURLToPath(new URL('DEJAVU-LICENSE.txt', out))}`);

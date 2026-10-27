// Export the committed SVG cards using an existing Sharp installation.
// Usage: node scripts/export-png.mjs /absolute/path/to/sharp/index.cjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { CARDS } from '../profile.config.mjs';
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
for (const card of CARDS) {
  const input = fileURLToPath(new URL(`../assets/card-${card.slug}.svg`, import.meta.url));
  let output = await sharp(input, { density: 144 }).png().toBuffer();
  if (['maxwellos', 'site', 'launcher'].includes(card.slug)) {
    // Composite raster captures directly: SVG rasterizers differ on embedded images.
    const capture = await readFile(new URL(`../assets/screenshots/${card.slug}.png`, import.meta.url));
    const mask = Buffer.from('<svg width="1240" height="496"><rect width="1240" height="496" rx="36" fill="white"/></svg>');
    const photo = await sharp(capture).resize(1240, 496, { fit: card.slug === 'launcher' ? 'cover' : 'contain', position: 'north', background: '#08121f' }).composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
    const label = card.slug === 'site' ? 'Website capture' : card.slug === 'launcher' ? 'App screenshot' : 'Desktop capture';
    const badge = Buffer.from(`<svg width="1240" height="496"><rect x="836" y="436" width="360" height="46" rx="12" fill="#070c15" opacity=".9"/><text x="1176" y="468" text-anchor="end" font-family="Consolas,monospace" font-size="22" fill="#bac9d8">${label}</text></svg>`);
    output = await sharp(output).composite([{input:photo,left:0,top:0},{input:badge,left:0,top:0}]).png().toBuffer();
  }
  await sharp(output).toFile(input.replace(/\.svg$/, '.png'));
}
console.log(`exported ${CARDS.length} PNG previews`);

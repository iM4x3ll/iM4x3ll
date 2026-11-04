// Project banners and avatar options in the same visual language as the profile page.
// Usage: node scripts/brand.mjs <out-dir>   (writes banner-<slug>.svg and avatar-*.svg)
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Same circuit-board language as scripts/build.mjs: solder mask, silkscreen, gold pads.
const C = { bg: "#0b2e22", line: "#1d4f3c", trace: "#17573f", silk: "#edf1e8", muted: "#a3c2b1", pad: "#d6ab3c", hole: "#05130d", chip: "#121715" };
const DIN = "Bahnschrift,'DIN Alternate','DIN 2014','Barlow Semi Condensed','Roboto Condensed','Arial Narrow',sans-serif";
const MONO = "'IBM Plex Mono','JetBrains Mono','Cascadia Mono',Consolas,'SF Mono',Menlo,monospace";
const SANS = "'IBM Plex Sans','Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const BANNERS = [
  { slug: "maxwellos", accent: "#a855f7", kind: "LINUX DISTRO", title: "MaxwellOS", tagline: "An Arch-based gaming Linux you can build and boot with one command.", tags: ["Arch Linux", "archiso", "KDE Plasma", "Bash", "Hyper-V"] },
  { slug: "xport", accent: "#22d3ee", kind: "GAME ENGINE MOD", title: "XPort", tagline: "Live GTA guest worlds inside San Andreas. Traversal in development.", tags: ["C++", "Direct3D 9", "re3 / reVC", "ASI plugin"] },
  { slug: "ouija", accent: "#c084fc", kind: "CHAT PLATFORM", title: "Ouija", tagline: "A lightweight, self-hostable alternative to Discord.", tags: ["TypeScript", "Fastify", "Prisma", "PostgreSQL"] },
  { slug: "powder-lab", accent: "#fb923c", kind: "SIMULATION", title: "Powder Lab", tagline: "A falling-sand chemistry sandbox for Windows.", tags: ["C#", "WPF", "Cellular automata", "Zero dependencies"] },
  { slug: "paradise-radio", accent: "#4ade80", kind: "DESKTOP APP", title: "Paradise", tagline: "A light Windows player for Radio Paradise with a soft-spoken DJ.", tags: ["Python", "PyQt6", "libVLC", "Neural TTS"] },
  { slug: "max-launcher", accent: "#f472b6", kind: "DESKTOP APP", title: "Game Library", tagline: "A 90 KB game launcher with no installer and no dependencies.", tags: ["C#", ".NET Framework", "WinForms", "Controller support"] },
  { slug: "riftfall", accent: "#38bdf8", kind: "ROBLOX GAME", title: "Riftfall", tagline: "Co-op portal expeditions: grab the loot, get out before it collapses.", tags: ["Luau", "Roblox Studio", "DataStores", "Co-op"] },
  { slug: "game-secrets", accent: "#facc15", kind: "WEB APP", title: "Game Secrets Scanner", tagline: "A searchable guide to easter eggs in open-world games.", tags: ["React 19", "JavaScript", "Create React App"] },
  { slug: "maxwell-tech-hub", accent: "#22d3ee", kind: "WEBSITE", title: "maxwellnixon.com", tagline: "Portfolio, 35+ developer tools, live data, and an arcade.", tags: ["Next.js 15", "TypeScript", "Tailwind", "Vercel"] },
];

const hole = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.pad}"/><circle cx="${x}" cy="${y}" r="${(r * .58).toFixed(1)}" fill="${C.hole}"/>`;

function banner(b) {
  const W = 1280, H = 260, cx = 1100, cy = 130, half = 54, n = 6, pitch = 14;
  let tx = 56;
  // Tags are drawn as silkscreen part outlines.
  const tags = b.tags.map((t) => {
    const w = t.length * 8.2 + 26, x = tx; tx += w + 10;
    return `<rect x="${x}" y="186" width="${w.toFixed(0)}" height="30" rx="2" fill="none" stroke="${C.silk}" stroke-opacity=".55"/><text x="${(x + w / 2).toFixed(1)}" y="206" text-anchor="middle" font-family="${MONO}" font-size="13.5" fill="${C.silk}">${esc(t)}</text>`;
  }).join("");
  let pins = "", traces = "";
  for (let i = 0; i < n; i++) {
    const o = (i - (n - 1) / 2) * pitch, ty = cy + (i - (n - 1) / 2) * 36, d = Math.abs(ty - (cy + o));
    pins += `<rect x="${cx - half - 12}" y="${cy + o - 3}" width="12" height="6" rx="1"/><rect x="${cx + half}" y="${cy + o - 3}" width="12" height="6" rx="1"/>`;
    pins += `<rect x="${cx + o - 3}" y="${cy - half - 12}" width="6" height="12" rx="1"/><rect x="${cx + o - 3}" y="${cy + half}" width="6" height="12" rx="1"/>`;
    traces += `<path d="M${cx - half - 12} ${cy + o}H${cx - half - 30}L${cx - half - 30 - d} ${ty}H860"/><path d="M${cx + half + 12} ${cy + o}H${cx + half + 26}L${cx + half + 26 + d} ${ty}H${W + 10}"/>`;
    traces += `<path d="M${cx + o} ${cy - half - 12}V-10"/><path d="M${cx + o} ${cy + half + 12}V${H + 10}"/>`;
  }
  const vias = Array.from({ length: n }, (_, i) => { const y = cy + (i - (n - 1) / 2) * 36; return `<circle cx="860" cy="${y}" r="4.5" fill="${C.pad}"/><circle cx="860" cy="${y}" r="1.8" fill="${C.hole}"/>`; }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img"><title>${esc(b.title)}: ${esc(b.tagline)}</title>
  <defs><clipPath id="c"><rect width="${W}" height="${H}" rx="14"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    <g fill="none" stroke="${C.trace}" stroke-width="3" stroke-linejoin="round">${traces}</g>${vias}
    <g fill="${C.pad}">${pins}</g>
    <rect x="${cx - half}" y="${cy - half}" width="${half * 2}" height="${half * 2}" rx="4" fill="${C.chip}"/>
    <circle cx="${cx - half + 13}" cy="${cy - half + 13}" r="4" fill="#2b322f"/>
    <text x="${cx}" y="${cy + 13}" text-anchor="middle" font-family="${DIN}" font-size="38" font-weight="700" fill="#5f6a65">${esc(b.title[0].toUpperCase())}</text>
    ${hole(26, 26)}${hole(26, H - 26)}
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>
  <text x="56" y="64" font-family="${MONO}" font-size="13.5" letter-spacing="2.5" fill="${C.pad}">${esc(b.kind)}</text>
  <text x="54" y="124" font-family="${DIN}" font-size="54" font-weight="700" fill="${C.silk}">${esc(b.title)}</text>
  <text x="56" y="160" font-family="${SANS}" font-size="19" fill="${C.muted}">${esc(b.tagline)}</text>
  ${tags}</svg>\n`;
}

// Avatars: 512 units drawn at 1024 px. Everything important sits inside the circle GitLab crops to.
const frame = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1024" height="1024"><rect width="512" height="512" fill="${C.bg}"/>${inner}</svg>\n`;

// A: a gold "M" pad with a silkscreen ring, like a large fiducial.
const mPath = "M150 356 V156 H196 L256 262 L316 156 H362 V356 H318 V236 L270 322 H242 L194 236 V356 Z";
const avatarA = frame(`<circle cx="256" cy="256" r="214" fill="none" stroke="${C.silk}" stroke-width="5" opacity=".75"/><path d="${mPath}" fill="${C.pad}"/>`);

// B: the pixel "M" laid out as a grid of square pads.
const M = ["100000001", "110000011", "101000101", "100101001", "100010001", "100000001", "100000001"];
const cs = 34, ox = 256 - (9 * cs - 6) / 2, oy = 256 - (7 * cs - 6) / 2;
const cells = M.map((row, y) => [...row].map((c, x) => `<rect x="${ox + x * cs}" y="${oy + y * cs}" width="${cs - 6}" height="${cs - 6}" rx="3" fill="${c === "1" ? C.pad : C.trace}"/>`).join("")).join("");
const avatarB = frame(cells);

// C: a chip seen from above, marked MN, with pin 1 dot.
let chipPins = "";
for (let i = 0; i < 8; i++) {
  const o = 256 - 105 + i * 30;
  chipPins += `<rect x="${o - 6}" y="104" width="12" height="28" rx="2"/><rect x="${o - 6}" y="380" width="12" height="28" rx="2"/><rect x="104" y="${o - 6}" width="28" height="12" rx="2"/><rect x="380" y="${o - 6}" width="28" height="12" rx="2"/>`;
}
const avatarC = frame(`<g fill="${C.pad}">${chipPins}</g><rect x="138" y="138" width="236" height="236" rx="10" fill="${C.chip}"/><circle cx="168" cy="168" r="10" fill="#2b322f"/>
  <text x="256" y="292" text-anchor="middle" font-family="${DIN}" font-size="104" font-weight="700" fill="${C.silk}">MN</text>`);

const out = process.argv[2];
if (out) {
  await mkdir(out, { recursive: true });
  for (const b of BANNERS) await writeFile(join(out, `banner-${b.slug}.svg`), banner(b));
  await writeFile(join(out, "avatar-a.svg"), avatarA);
  await writeFile(join(out, "avatar-b.svg"), avatarB);
  await writeFile(join(out, "avatar-c.svg"), avatarC);
  console.log(`wrote ${BANNERS.length} banners and 3 avatars to ${out}`);
}

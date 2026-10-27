// Project banners and avatar options in the same visual language as the profile page.
// Usage: node scripts/brand.mjs <out-dir>   (writes banner-<slug>.svg and avatar-*.svg)
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const C = { bg: "#05060a", panel: "#0b0d14", line: "#1b2030", cyan: "#22d3ee", purple: "#a855f7", gold: "#f5c451", text: "#e8ecf4", muted: "#8b93a7" };
const MONO = "'Cascadia Code','JetBrains Mono',Consolas,'SF Mono',Menlo,monospace";
const SANS = "'Segoe UI',Inter,system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
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

function banner(b) {
  const W = 1280, H = 260;
  let tx = 56;
  const tags = b.tags.map((t) => {
    const w = t.length * 8.4 + 26, x = tx; tx += w + 10;
    return `<rect x="${x}" y="188" width="${w.toFixed(0)}" height="30" rx="15" fill="${b.accent}" fill-opacity=".1" stroke="${b.accent}" stroke-opacity=".4"/><text x="${(x + w / 2).toFixed(1)}" y="208" text-anchor="middle" font-family="${MONO}" font-size="13.5" fill="${b.accent}">${esc(t)}</text>`;
  }).join("");
  let grid = "";
  for (let x = 760; x <= W; x += 40) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 20; y < H; y += 40) grid += `<line x1="760" y1="${y}" x2="${W}" y2="${y}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img"><title>${esc(b.title)}: ${esc(b.tagline)}</title>
  <defs>
    <radialGradient id="g" cx="1" cy="0" r="1"><stop offset="0" stop-color="${b.accent}" stop-opacity=".3"/><stop offset="1" stop-color="${b.accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="m" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000"/></linearGradient>
    <mask id="fade"><rect x="760" width="520" height="${H}" fill="url(#m)"/></mask>
    <clipPath id="c"><rect width="${W}" height="${H}" rx="20"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="${W}" height="${H}" fill="${C.panel}"/>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <g stroke="${b.accent}" stroke-opacity=".28" mask="url(#fade)">${grid}</g>
    <circle cx="1120" cy="130" r="64" fill="none" stroke="${b.accent}" stroke-opacity=".5" stroke-width="2" stroke-dasharray="6 10"><animateTransform attributeName="transform" type="rotate" from="0 1120 130" to="360 1120 130" dur="40s" repeatCount="indefinite"/></circle>
    <circle cx="1120" cy="130" r="34" fill="${b.accent}" fill-opacity=".14" stroke="${b.accent}" stroke-opacity=".7"><animate attributeName="r" values="34;40;34" dur="5s" repeatCount="indefinite"/></circle>
    <text x="1120" y="141" text-anchor="middle" font-family="${SANS}" font-size="32" font-weight="800" fill="${b.accent}">${esc(b.title[0].toUpperCase())}</text>
  </g>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="19" fill="none" stroke="${C.line}"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="19" fill="none" stroke="${b.accent}" stroke-width="2" stroke-linecap="round" pathLength="1000" stroke-dasharray="90 910"><animate attributeName="stroke-dashoffset" from="1000" to="0" dur="9s" repeatCount="indefinite"/></rect>
  <text x="56" y="62" font-family="${MONO}" font-size="14" letter-spacing="3" fill="${b.accent}">${esc(b.kind)}</text>
  <text x="56" y="122" font-family="${SANS}" font-size="52" font-weight="800" fill="${C.text}">${esc(b.title)}</text>
  <text x="56" y="160" font-family="${SANS}" font-size="20" fill="${C.muted}">${esc(b.tagline)}</text>
  ${tags}</svg>\n`;
}

const sweep = `<linearGradient id="sw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.cyan}"/><stop offset=".55" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.gold}"/></linearGradient>`;
const aura = `<radialGradient id="au" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#1b1140"/><stop offset=".6" stop-color="#070912"/><stop offset="1" stop-color="${C.bg}"/></radialGradient>`;
const frame = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1024" height="1024"><defs>${sweep}${aura}<filter id="gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter></defs><rect width="512" height="512" fill="url(#au)"/>${inner}</svg>\n`;

// A: bold monogram. Everything important sits inside the circle GitLab crops to.
const mPath = "M150 356 V156 H196 L256 262 L316 156 H362 V356 H318 V236 L270 322 H242 L194 236 V356 Z";
const avatarA = frame(`<circle cx="256" cy="256" r="214" fill="none" stroke="url(#sw)" stroke-width="6" opacity=".9"/><path d="${mPath}" fill="url(#sw)" filter="url(#gl)" opacity=".75"/><path d="${mPath}" fill="url(#sw)"/>`);

// B: the pixel "M" from the terminal panel.
const M = ["100000001", "110000011", "101000101", "100101001", "100010001", "100000001", "100000001"];
const cs = 34, ox = 256 - (9 * cs - 6) / 2, oy = 256 - (7 * cs - 6) / 2;
const cells = M.map((row, y) => [...row].map((c, x) => `<rect x="${ox + x * cs}" y="${oy + y * cs}" width="${cs - 6}" height="${cs - 6}" rx="6" fill="${c === "1" ? "url(#sw)" : "#161a27"}"/>`).join("")).join("");
const avatarB = frame(`<circle cx="256" cy="256" r="232" fill="#080a11" stroke="${C.line}" stroke-width="2"/>${cells}`);

// C: monogram over the header's horizon grid.
let rays = "";
for (let x = -600; x <= 1112; x += 86) rays += `<line x1="256" y1="330" x2="${x}" y2="512" stroke="${C.purple}" stroke-opacity=".5"/>`;
for (let i = 1; i <= 6; i++) { const y = 330 + Math.pow(i / 6, 2) * 182; rays += `<line x1="0" x2="512" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${C.cyan}" stroke-opacity="${(0.15 + i * 0.09).toFixed(2)}"/>`; }
const mSmall = "M166 318 V138 H206 L256 228 L306 138 H346 V318 H308 V210 L268 284 H244 L204 210 V318 Z";
const avatarC = frame(`${rays}<rect y="328" width="512" height="3" fill="url(#sw)"/><path d="${mSmall}" fill="url(#sw)" filter="url(#gl)" opacity=".8"/><path d="${mSmall}" fill="url(#sw)"/>`);

const out = process.argv[2];
if (out) {
  await mkdir(out, { recursive: true });
  for (const b of BANNERS) await writeFile(join(out, `banner-${b.slug}.svg`), banner(b));
  await writeFile(join(out, "avatar-a.svg"), avatarA);
  await writeFile(join(out, "avatar-b.svg"), avatarB);
  await writeFile(join(out, "avatar-c.svg"), avatarC);
  console.log(`wrote ${BANNERS.length} banners and 3 avatars to ${out}`);
}

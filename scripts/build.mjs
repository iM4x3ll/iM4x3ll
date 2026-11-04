// Generates every graphic on the profile page from profile.config.mjs.
// No dependencies: node scripts/build.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PROFILE, LINES, CARDS, DOMAINS, STATS } from "../profile.config.mjs";

import { projectArt } from "./project-art.mjs";

const SCREENSHOTS = {};
for (const [slug, extension] of [["maxwellos", "png"], ["site", "png"], ["launcher", "png"]]) {
  const bytes = await readFile(new URL(`../assets/screenshots/${slug}.${extension}`, import.meta.url));
  SCREENSHOTS[slug] = `data:image/${extension};base64,${bytes.toString("base64")}`;
}

const OUT = fileURLToPath(new URL("../assets/", import.meta.url));
// The profile is drawn as a printed circuit board: green solder mask, copper traces under the mask,
// white silkscreen for text and gold (ENIG) pads. Gold is the only accent.
const C = {
  bg: "#0b2e22", panel: "#0d3427", line: "#1d4f3c", trace: "#17573f", traceHi: "#2a7d5d",
  silk: "#edf1e8", muted: "#a3c2b1", pad: "#d6ab3c", padDim: "#8c6d1f", hole: "#05130d", chip: "#121715",
};
C.text = C.silk; C.cyan = C.traceHi; C.purple = C.pad; C.gold = C.pad; // names used by the card and activity art
// Bahnschrift (Windows) and DIN Alternate (macOS) read like board silkscreen; widths are pinned with textLength where it matters.
const DIN = "Bahnschrift,'DIN Alternate','DIN 2014','Barlow Semi Condensed','Roboto Condensed','Arial Narrow',sans-serif";
const MONO = "'IBM Plex Mono','JetBrains Mono','Cascadia Mono',Consolas,'SF Mono',Menlo,monospace";
const SANS = "'IBM Plex Sans','Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svg = (w, h, body, motion = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><style>${MOTION}${motion}</style>${body}</svg>\n`;

const MOTION = `
  .pulse { stroke-dasharray: 5 120; stroke-dashoffset: 5; animation: pulse 6s linear infinite; }
  .led { animation: led 2.4s steps(1,end) infinite; }
  @keyframes pulse { 0% { stroke-dashoffset: 5; opacity: 0; } 6%,80% { opacity: 1; } 100% { stroke-dashoffset: -100; opacity: 0; } }
  @keyframes led { 50% { opacity: .2; } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } .pulse { opacity: 0; } }
`;

const board = (W, H, inner) => `
  <defs><clipPath id="board"><rect width="${W}" height="${H}" rx="14"/></clipPath></defs>
  <g clip-path="url(#board)"><rect width="${W}" height="${H}" fill="${C.bg}"/>${inner}</g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>`;
const hole = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.pad}"/><circle cx="${x}" cy="${y}" r="${(r * .58).toFixed(1)}" fill="${C.hole}"/>`;
const via = (x, y) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${C.pad}"/><circle cx="${x}" cy="${y}" r="1.8" fill="${C.hole}"/>`;
const corners = (W, H, m = 26) => [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].map(([x, y]) => hole(x, y)).join("");
// Deterministic PRNG so rebuilds do not churn the diff.
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sweepDefs = (w) => `
  <linearGradient id="sweep" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="0">
    <stop offset="0" stop-color="${C.pad}"/><stop offset="1" stop-color="${C.padDim}"/>
  </linearGradient>`;

function header() {
  const W = 1280, H = 520, cx = 1000, cy = 268, half = 92, n = 10, pitch = 15, pl = 16;
  const k = (i) => i - (n - 1) / 2;
  let pins = "", traces = "", ends = "", pulses = "";
  const pulseOn = { left: 6, right: 2, top: 7, bottom: 3 };
  const trace = (d, side, i, delay) => {
    traces += `<path d="${d}"/>`;
    if (pulseOn[side] === i) pulses += `<path class="pulse" d="${d}" pathLength="100" style="animation-delay:${delay}s"/>`;
  };
  for (let i = 0; i < n; i++) {
    const o = k(i) * pitch, y = cy + o, x = cx + o;
    pins += `<rect x="${cx - half - pl}" y="${y - 3.5}" width="${pl}" height="7" rx="1"/><rect x="${cx + half}" y="${y - 3.5}" width="${pl}" height="7" rx="1"/>`;
    pins += `<rect x="${x - 3.5}" y="${cy - half - pl}" width="7" height="${pl}" rx="1"/><rect x="${x - 3.5}" y="${cy + half}" width="7" height="${pl}" rx="1"/>`;
    // left: fan down into the notes area and stop at vias
    const ty = 236 + i * 19, dl = ty - y;
    trace(`M${cx - half - pl} ${y}H860L${860 - dl} ${ty}H690`, "left", i, -1);
    ends += via(690, ty);
    // right: spread out and leave the board like an edge connector
    const ry = cy + k(i) * 26, dr = Math.abs(ry - y);
    trace(`M${cx + half + pl} ${y}H1140L${1140 + dr} ${ry}H1300`, "right", i, -3);
    // top and bottom: spread sideways, then run to vias
    const tx = cx + k(i) * 30, dt = Math.abs(tx - x);
    trace(`M${x} ${cy - half - pl}V140L${tx} ${140 - dt}V48`, "top", i, -2);
    trace(`M${x} ${cy + half + pl}V396L${tx} ${396 + dt}V470`, "bottom", i, -4.5);
    ends += via(tx, 48) + via(tx, 470);
  }
  const notes = PROFILE.typed.map((t, i) =>
    `<text x="72" y="${292 + i * 27}"><tspan fill="${C.pad}">${i + 1}.</tspan> ${esc(t.replace(/^>\s*/, ""))}</text>`).join("");
  const resistor = (x, y, ref) => `<g><rect x="${x - 16}" y="${y - 7}" width="11" height="14" rx="1.5" fill="${C.pad}"/><rect x="${x + 5}" y="${y - 7}" width="11" height="14" rx="1.5" fill="${C.pad}"/>
    <rect x="${x - 21}" y="${y - 11}" width="42" height="22" rx="2" fill="none" stroke="${C.silk}" stroke-opacity=".55"/>
    <text x="${x}" y="${y - 17}" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${C.silk}" opacity=".8">${ref}</text></g>`;
  return svg(W, H, `
    <title>${esc(PROFILE.name)}: ${esc(PROFILE.tagline.replace(/\s+·\s+/g, ", "))}</title>
    <desc>A circuit board. The name is printed in silkscreen beside a large chip whose pins fan out into copper traces. Small pulses travel along a few traces.</desc>
    ${board(W, H, `
      <g fill="none" stroke="${C.trace}" stroke-width="3" stroke-linejoin="round">${traces}</g>
      <g fill="none" stroke="${C.pad}" stroke-width="3" stroke-linecap="round">${pulses}</g>
      ${ends}
      <g fill="${C.pad}">${pins}</g>
      <rect x="${cx - half}" y="${cy - half}" width="${half * 2}" height="${half * 2}" rx="5" fill="${C.chip}"/>
      <circle cx="${cx - half + 18}" cy="${cy - half + 18}" r="5" fill="#2b322f"/>
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="${DIN}" font-size="40" font-weight="700" letter-spacing="3" fill="#5f6a65">NIXON</text>
      <text x="${cx}" y="${cy + 32}" text-anchor="middle" font-family="${MONO}" font-size="12" letter-spacing="2" fill="#4f5955">SYS-2611 NJ</text>
      <path d="M${cx - half - pl - 10} ${cy - half - pl + 14}V${cy - half - pl - 10}H${cx - half - pl + 14}" fill="none" stroke="${C.silk}" stroke-width="1.5" opacity=".7"/>
      <text x="${cx - half - pl - 10}" y="${cy - half - pl - 18}" font-family="${MONO}" font-size="13" fill="${C.silk}">U1</text>
      ${resistor(745, 452, "R1")}${resistor(812, 452, "R2")}
      <g><circle cx="778" cy="496" r="7" fill="#57e389" class="led"/><circle cx="778" cy="496" r="11" fill="none" stroke="${C.silk}" stroke-opacity=".55"/>
        <text x="796" y="500" font-family="${MONO}" font-size="11" fill="${C.silk}" opacity=".8">D1</text></g>
      ${corners(W, H)}
      <g font-family="${MONO}" font-size="13" fill="${C.muted}">
        <text x="56" y="31">${esc(PROFILE.user)} · main board</text>
        <text x="1224" y="31" text-anchor="end">${esc(PROFILE.site)}</text>
        <text x="56" y="499" font-size="12">REV 2026.11 · ASSEMBLED IN NEW JERSEY</text>
      </g>
      <text x="70" y="150" font-family="${DIN}" font-size="92" font-weight="700" letter-spacing="1" textLength="640" lengthAdjust="spacingAndGlyphs" fill="${C.silk}">${esc(PROFILE.name)}</text>
      <text x="72" y="192" font-family="${MONO}" font-size="17" fill="${C.muted}" xml:space="preserve">${esc(PROFILE.tagline)}</text>
      <text x="72" y="260" font-family="${DIN}" font-size="15" font-weight="700" letter-spacing="2.5" fill="${C.silk}">NOTES</text>
      <g font-family="${MONO}" font-size="15" fill="${C.silk}">${notes}</g>`)}`.replace(/[ \t]+$/gm, ""));
}

function terminal() {
  const W = 1280, top = 132, LH = 36, H = top + LINES.length * LH + 40;
  const rows = LINES.map(([key, value], i) => {
    const y = top + i * LH;
    return `<text x="72" y="${y}" font-family="${MONO}" font-size="14" fill="${C.pad}">U${i + 1}</text>
      <text x="150" y="${y}" font-family="${DIN}" font-size="17" font-weight="700" letter-spacing="1.5" fill="${C.silk}">${esc(key.toUpperCase())}</text>
      <text x="330" y="${y}" font-family="${SANS}" font-size="15.5" fill="${C.silk}">${esc(value)}</text>
      ${i < LINES.length - 1 ? `<path d="M72 ${y + 13}H1208" stroke="${C.line}"/>` : ""}`;
  }).join("");
  return svg(W, H, `
  <title>Bill of materials: what I work with</title>
  ${board(W, H, `
    ${corners(W, H)}
    <text x="72" y="58" font-family="${DIN}" font-size="24" font-weight="700" letter-spacing="2" fill="${C.silk}">BILL OF MATERIALS</text>
    <text x="1208" y="58" text-anchor="end" font-family="${MONO}" font-size="13" fill="${C.muted}">$ whoami --verbose</text>
    <g font-family="${MONO}" font-size="12" letter-spacing="1.5" fill="${C.muted}"><text x="72" y="96">REF</text><text x="150" y="96">FUNCTION</text><text x="330" y="96">PARTS</text></g>
    <path d="M72 106H1208" stroke="${C.silk}" stroke-opacity=".45"/>
    ${rows}`)}`);
}

function card(c, i) {
  const W = 620, H = 440;
  let tx = 32;
  const tags = c.tags.map((t) => {
    const w = t.length * 7.9 + 22, x = tx; tx += w + 8;
    return `<rect x="${x}" y="391" width="${w.toFixed(0)}" height="26" rx="13" fill="${c.accent}" fill-opacity=".1" stroke="${c.accent}" stroke-opacity=".35"/><text x="${(x + w / 2).toFixed(1)}" y="409" text-anchor="middle" font-family="${MONO}" font-size="12.5" fill="${c.accent}">${esc(t)}</text>`;
  }).join("");
  const capture = SCREENSHOTS[c.slug];
  const artwork = capture ? `<image xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${capture}" width="620" height="248" preserveAspectRatio="${c.slug === "launcher" ? "xMidYMin slice" : "xMidYMid meet"}"/>` : projectArt(c.slug, c.accent);
  const label = capture ? (c.slug === "site" ? "Website capture" : c.slug === "launcher" ? "App screenshot" : "Desktop capture") : "Project illustration";
  return svg(W, H, `
  <title>${esc(c.title)}</title>
  <defs><clipPath id="art"><rect width="620" height="248" rx="18"/></clipPath><radialGradient id="g" cx="1" cy="0" r="1"><stop offset="0" stop-color="${c.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${c.accent}" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" rx="18" fill="${C.panel}"/>
  <rect width="${W}" height="${H}" rx="18" fill="url(#g)"/>
  <g clip-path="url(#art)">${artwork}</g>
  <rect x="418" y="218" width="180" height="23" rx="6" fill="#070c15" fill-opacity=".85"/>
  <text x="588" y="234" text-anchor="end" font-family="${MONO}" font-size="11" fill="#bac9d8">${label}</text>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17" fill="none" stroke="${C.line}"/>
  <text x="32" y="278" font-family="${MONO}" font-size="13" letter-spacing="2" fill="${c.accent}">${esc(c.tags[0])}</text>
  <text x="${W - 32}" y="278" text-anchor="end" font-family="${MONO}" font-size="13" fill="${C.muted}">open ↗</text>
  <text x="32" y="315" font-family="${SANS}" font-size="29" font-weight="700" fill="${C.text}">${esc(c.title)}</text>
  ${c.lines.map((l, n) => `<text x="32" y="${344 + n * 22}" font-family="${SANS}" font-size="15.5" fill="${C.muted}">${esc(l)}</text>`).join("")}
  ${tags}`);
}

async function calendar() {
  try {
    const res = await fetch(`https://gitlab.com/users/${PROFILE.user}/calendar.json`, { signal: AbortSignal.timeout(15000) });
    return res.ok ? await res.json() : {};
  } catch { return {}; }
}

function activity(cal) {
  const W = 1280, H = 286, cs = 18, gap = 4, step = cs + gap, weeks = 53, x0 = (W - weeks * step + gap) / 2, y0 = 102;
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today); start.setUTCDate(start.getUTCDate() - today.getUTCDay() - (weeks - 1) * 7);
  const shade = (n) => (n === 0 ? "#1a2030" : n < 3 ? "#155e75" : n < 6 ? "#0891b2" : n < 10 ? C.cyan : C.purple);
  let cells = "", months = "", total = 0, days = 0, best = 0, lastMonth = -1;
  for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) {
    const dt = new Date(start); dt.setUTCDate(start.getUTCDate() + w * 7 + d);
    if (dt > today) continue;
    const n = Number(cal[dt.toISOString().slice(0, 10)] ?? 0);
    total += n; if (n) days++; best = Math.max(best, n);
    if (d === 0 && dt.getUTCMonth() !== lastMonth && dt.getUTCDate() <= 7) {
      lastMonth = dt.getUTCMonth();
      months += `<text x="${x0 + w * step}" y="${y0 - 10}">${dt.toLocaleString("en-US", { month: "short", timeZone: "UTC" })}</text>`;
    }
    cells += `<rect x="${x0 + w * step}" y="${y0 + d * step}" width="${cs}" height="${cs}" rx="4" fill="${shade(n)}"></rect>`;
  }
  const stat = (x, v, l) => `<text x="${x}" y="38" font-family="${SANS}" font-size="24" font-weight="700" fill="${C.text}">${v}</text><text x="${x}" y="56" font-family="${MONO}" font-size="11.5" letter-spacing="1.5" fill="${C.muted}">${l}</text>`;
  return svg(W, H, `
  <title>Contribution activity</title>
  <defs>${sweepDefs(W)}</defs>
  <rect width="${W}" height="${H}" rx="18" fill="${C.panel}"/>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${C.line}"/>
  <text x="${x0}" y="40" font-family="${MONO}" font-size="14" letter-spacing="2" fill="${C.cyan}">CONTRIBUTION SIGNAL</text>
  <text x="${x0}" y="58" font-family="${MONO}" font-size="11.5" fill="${C.muted}">rebuilt by CI · ${today.toISOString().slice(0, 10)}</text>
  ${stat(W - x0 - 330, total, "PAST YEAR")}${stat(W - x0 - 200, days, "ACTIVE DAYS")}${stat(W - x0 - 60, best, "BEST DAY")}
  <g font-family="${MONO}" font-size="11" fill="${C.muted}">${months}</g>
  ${cells}
  <rect x="${x0}" y="${H - 14}" width="${weeks * step - gap}" height="2" rx="1" fill="url(#sweep)" opacity=".7"/>`);
}

function divider() {
  const W = 1280, H = 14;
  return svg(W, H, `<path d="M18 7H${W - 18}" stroke="${C.traceHi}" stroke-width="3"/>${via(14, 7)}${via(W - 14, 7)}`);
}

function domains() {
  // Drawn as a 2x4 pin header: odd pins down the left column, even pins down the right, pin 1 square.
  const W = 1280, top = 104, RH = 80, H = top + 4 * RH + 12;
  const pins = DOMAINS.map((d, i) => {
    const x = i % 2 ? 680 : 72, y = top + Math.floor(i / 2) * RH, px = x + 14, py = y - 6;
    const pad = i === 0
      ? `<rect x="${px - 12}" y="${py - 12}" width="24" height="24" rx="2" fill="${C.pad}"/>`
      : `<circle cx="${px}" cy="${py}" r="12" fill="${C.pad}"/>`;
    return `${pad}<circle cx="${px}" cy="${py}" r="5" fill="${C.hole}"/>
      <text x="${x + 46}" y="${y}" font-family="${MONO}" font-size="13" fill="${C.pad}">${i + 1}</text>
      <text x="${x + 76}" y="${y}" font-family="${DIN}" font-size="20" font-weight="700" letter-spacing=".5" fill="${C.silk}">${esc(d.title)}</text>
      ${d.lines.map((l, k) => `<text x="${x + 76}" y="${y + 24 + k * 20}" font-family="${SANS}" font-size="14.5" fill="${C.muted}">${esc(l)}</text>`).join("")}`;
  }).join("");
  return svg(W, H, `<title>What I do</title>
  ${board(W, H, `
    ${corners(W, H)}
    <text x="72" y="58" font-family="${DIN}" font-size="24" font-weight="700" letter-spacing="2" fill="${C.silk}">J2 · WHAT I DO</text>
    <text x="1208" y="58" text-anchor="end" font-family="${MONO}" font-size="13" fill="${C.muted}">8-pin header · 2.54 mm pitch</text>
    ${pins}`)}`);
}

function stats() {
  const W = 1280, H = 176, x0 = 56, col = (W - x0 * 2) / STATS.length;
  const cells = STATS.map((st, i) => {
    const x = x0 + col * i + 18;
    return `<circle cx="${x + 6}" cy="${40}" r="6" fill="none" stroke="${C.pad}" stroke-width="3"/>
      <text x="${x + 20}" y="${45}" font-family="${MONO}" font-size="12" letter-spacing="1" fill="${C.muted}">TP${i + 1}</text>
      <text x="${x}" y="108" font-family="${DIN}" font-size="54" font-weight="700" fill="${C.silk}">${esc(st.value)}</text>
      ${st.label.map((l, k) => `<text x="${x}" y="${134 + k * 17}" font-family="${MONO}" font-size="11.5" letter-spacing="1" fill="${C.muted}">${esc(l)}</text>`).join("")}
      ${i ? `<path d="M${x0 + col * i} 30V150" stroke="${C.line}"/>` : ""}`;
  }).join("");
  return svg(W, H, `<title>By the numbers</title>${board(W, H, cells)}`);
}

await mkdir(OUT, { recursive: true });
const files = {
  "header.svg": header(), "terminal.svg": terminal(), "divider.svg": divider(), "domains.svg": domains(),
  "stats.svg": stats(),
  ...Object.fromEntries(CARDS.map((c, i) => [`card-${c.slug}.svg`, card(c, i)])),
};
if (!process.argv.includes("--profile-only")) {
  files["activity.svg"] = activity(await calendar());
}
for (const [name, body] of Object.entries(files)) await writeFile(OUT + name, body);
console.log(`built ${Object.keys(files).length} graphics`);

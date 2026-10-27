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
const C = { bg: "#05060a", panel: "#0b0d14", line: "#1b2030", cyan: "#22d3ee", purple: "#a855f7", gold: "#f5c451", text: "#e8ecf4", muted: "#8b93a7" };
const MONO = "'Cascadia Code','JetBrains Mono',Consolas,'SF Mono',Menlo,monospace";
const SANS = "'Segoe UI',Inter,system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const svg = (w, h, body, motion = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><style>${MOTION}${motion}</style>${body}</svg>\n`;


const MOTION = `
  .star { animation: shimmer 8s ease-in-out infinite; }
  .orbit { transform-box: fill-box; transform-origin: center; animation: orbit 32s linear infinite; }
  .counter-orbit { animation-direction: reverse; animation-duration: 44s; }
  .packet { animation: packet 8s linear infinite; }
  .grid-row { animation: grid 6s linear infinite; }
  .typed-line { opacity: 0; animation: type-line 30s steps(1,end) infinite; }
  .typed-window { animation: typing 30s steps(var(--chars),end) infinite; }
  .first-line { opacity: 1; }
  .cursor { animation: blink 1.2s steps(1,end) infinite; }
  .reveal { animation: reveal .7s ease-out both; }
  .card-trace { animation: trace 14s linear infinite; }
  @keyframes shimmer { 50% { opacity: .22; } }
  @keyframes orbit { to { transform: rotate(360deg); } }
  @keyframes packet { 0% { transform: translateX(0); opacity: 0; } 10%,85% { opacity: .8; } 100% { transform: translateX(360px); opacity: 0; } }
  @keyframes grid { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: .28; } 80% { opacity: .28; } 100% { transform: translateY(var(--travel)); opacity: 0; } }
  @keyframes type-line { 0%,19.99% { opacity: 1; } 20%,100% { opacity: 0; } }
  @keyframes typing { 0% { width: 0; } 8%,17% { width: var(--width); } 19%,100% { width: 0; } }
  @keyframes blink { 50% { opacity: .15; } }
  @keyframes reveal { from { opacity: .15; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes trace { to { stroke-dashoffset: -1000; } }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; }
    .typed-line { opacity: 0; }
    .first-line { opacity: 1; }
    .typed-window { width: var(--width); }
    .grid-row { opacity: .2; }
    .cursor { opacity: .7; }
  }
`;
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
  <linearGradient id="sweep" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="0" spreadMethod="repeat">
    <stop offset="0" stop-color="${C.cyan}"/><stop offset=".33" stop-color="${C.purple}"/>
    <stop offset=".66" stop-color="${C.gold}"/><stop offset="1" stop-color="${C.cyan}"/>

  </linearGradient>`;

function header() {
  const W = 1280, H = 620, random = rng(7);
  const motion = `
    .name-sheen { transform: translateX(-480px); animation: name-sheen 10s ease-in-out infinite; }
    @keyframes name-sheen { 0%,12% { transform: translateX(-480px); } 55%,100% { transform: translateX(1500px); } }
    .portal-spin { transform-box: fill-box; transform-origin: center; animation: portal-spin 28s linear infinite; }
    .portal-reverse { animation-direction: reverse; animation-duration: 42s; }
    .portal-flow { animation: portal-flow 12s linear infinite; }
    .portal-depth { transform-box: fill-box; transform-origin: center; animation: portal-depth 12s linear infinite; }
    .portal-core { animation: portal-core 9s ease-in-out infinite; }
    @keyframes portal-spin { to { transform: rotate(360deg); } }
    @keyframes portal-flow { to { stroke-dashoffset: -240; } }
    @keyframes portal-depth { 0% { transform: scale(.25); opacity: 0; } 15% { opacity: .2; } 75% { opacity: .35; } 100% { transform: scale(1); opacity: 0; } }
    @keyframes portal-core { 50% { opacity: .65; } }
    @media (prefers-reduced-motion: reduce) { .portal-depth { opacity: .18; } }
  `;
  const nameText = (attributes = '') => `<text x="640" y="166" text-anchor="middle" font-family="${SANS}" font-size="82" font-weight="800" letter-spacing="5" ${attributes}>${esc(PROFILE.name)}</text>`;
  const stars = Array.from({ length: 52 }, () => {
    const x = (random()*W).toFixed(1), y = (55+random()*430).toFixed(1);
    return `<circle class="star" cx="${x}" cy="${y}" r="${(.45+random()*.9).toFixed(1)}" fill="#dbeafe" opacity=".4" style="animation-delay:-${(random()*8).toFixed(1)}s"/>`;
  }).join('');
  const typed = PROFILE.typed.map((text, i) => {
    const width = text.length*9.65+8, x = (W-width)/2, delay = -30+i*6;
    return `<clipPath id="type-${i}"><rect class="typed-window" x="${x}" y="232" width="${width}" height="30" style="--chars:${text.length};--width:${width}px;animation-delay:${delay}s"/></clipPath>
      <g class="typed-line ${i === 0 ? 'first-line' : ''}" style="animation-delay:${delay}s"><text x="${x}" y="254" font-family="${MONO}" font-size="16" fill="${C.text}" clip-path="url(#type-${i})">${esc(text)}</text></g>`;
  }).join('');
  const circuit = `<g fill="none" stroke="#67e8f9" stroke-width="1.5" opacity=".65">
    <path d="M-66-32H-34V-56H-8M-65 36H-36V60H-8M64-44H36V-18H18M66 44H42V18H18M-10-78V-22M-10 78V22"/>
    <rect x="-22" y="-22" width="44" height="44" rx="6"/><rect x="-13" y="-13" width="26" height="26" rx="3"/>
    ${[-66,66].map((x,i)=>`<circle cx="${x}" cy="${i ? 44 : -32}" r="3" fill="#baf8ff"/>`).join('')}
  </g>`;
  const world = `<g fill="none" stroke="#c4b5fd" stroke-width="1" opacity=".5">
    <circle r="75"/><ellipse rx="38" ry="75"/><ellipse rx="15" ry="75"/>
    <ellipse rx="75" ry="24"/><path d="M-71-24H71M-71 24H71M-54-52H54M-54 52H54M0-75V75"/>
  </g><path d="M-82 32L-58 5L-34 22L-6-13L23 18L46-4L79 29V78H-82Z" fill="#070c1b" fill-opacity=".8" stroke="#a78bfa" stroke-width="1.4"/>
    <path d="M-82 55L-34 22L23 18L79 55M-58 5L-45 78M-6-13L-9 78M46-4L55 78" fill="none" stroke="#a78bfa" opacity=".5"/>`;
  const nodes = [[-52,-40],[-8,-61],[48,-27],[55,34],[2,57],[-49,24],[0,0]];
  const ideas = `<g stroke="#f5c451" fill="none" opacity=".55"><path d="M-52-40L-8-61L48-27L55 34L2 57L-49 24Z M0 0L-52-40M0 0L48-27M0 0L2 57M-8-61L-49 24M55 34L-8-61"/></g>
    ${nodes.map(([x,y],i)=>`<circle class="portal-core" cx="${x}" cy="${y}" r="${i===6 ? 6 : 3}" fill="#fff0b0" style="animation-delay:-${i}s"/>`).join('')}`;
  const portals = [
    {x:300,y:432,r:95,color:C.cyan,light:'#baf8ff',label:'systems',inside:circuit,scale:.82},
    {x:640,y:418,r:125,color:C.purple,light:'#ead7ff',label:'worlds',inside:world,scale:1},
    {x:980,y:432,r:95,color:C.gold,light:'#fff0b0',label:'ideas',inside:ideas,scale:.82},
  ];
  const defs = portals.map((p,i)=>`
    <radialGradient id="ambient-${i}"><stop stop-color="${p.color}" stop-opacity=".32"/><stop offset=".45" stop-color="${p.color}" stop-opacity=".09"/><stop offset="1" stop-color="${p.color}" stop-opacity="0"/></radialGradient>
    <radialGradient id="core-${i}"><stop stop-color="#091424"/><stop offset=".72" stop-color="#080c17"/><stop offset="1" stop-color="${p.color}" stop-opacity=".24"/></radialGradient>
    <linearGradient id="rim-${i}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.light}"/><stop offset=".3" stop-color="${p.color}"/><stop offset=".6" stop-color="#101827"/><stop offset="1" stop-color="${p.color}"/></linearGradient>
    <clipPath id="portal-clip-${i}"><circle r="${p.r-13}"/></clipPath>`).join('');
  const scene = portals.map((p,i)=>`
    <ellipse cx="${p.x}" cy="${p.y}" rx="${p.r*2}" ry="${p.r*1.6}" fill="url(#ambient-${i})"/>
    <ellipse cx="${p.x}" cy="${p.y+p.r+15}" rx="${p.r*1.55}" ry="30" fill="url(#ambient-${i})"/>
    <path d="M${p.x-p.r*.7} ${p.y+p.r}L${p.x-p.r*1.4} 620H${p.x+p.r*1.4}L${p.x+p.r*.7} ${p.y+p.r}Z" fill="url(#ambient-${i})" opacity=".45"/>
    <g transform="translate(${p.x} ${p.y}) scale(${p.scale} 1)">
      <circle cx="8" cy="4" r="${p.r+4}" fill="#070a11" stroke="#1e293b" stroke-width="9"/>
      <circle r="${p.r}" fill="url(#core-${i})" stroke="url(#rim-${i})" stroke-width="9"/>
      <circle r="${p.r-8}" fill="none" stroke="${p.color}" stroke-width="3" filter="url(#bloom)"/>
      <circle r="${p.r-9}" fill="none" stroke="${p.light}" stroke-width="1.5"/>
      <circle class="portal-spin" r="${p.r+9}" fill="none" stroke="${p.color}" stroke-width="3" stroke-dasharray="38 10 3 10" style="animation-delay:-${i*7}s"/>
      <circle class="portal-spin portal-reverse" r="${p.r-5}" fill="none" stroke="${p.light}" stroke-width="2" stroke-dasharray="60 90 2 20" opacity=".6"/>
      <g clip-path="url(#portal-clip-${i})">
        ${[0,1,2].map(n=>`<circle class="portal-depth" r="${p.r-16}" fill="none" stroke="${p.color}" stroke-width="1" opacity=".18" style="animation-delay:-${n*4+i}s"/>`).join('')}
        ${p.inside}
      </g>
      <path d="M${-p.r*.7} ${-p.r*.71}A${p.r} ${p.r} 0 0 1 ${p.r*.7} ${-p.r*.71}" fill="none" stroke="${p.light}" stroke-width="2" opacity=".8"/>
      <path d="M-20 ${p.r+9}H20L32 ${p.r+18}H-32Z" fill="#162131" stroke="${p.color}" stroke-opacity=".35"/>
    </g>
    <text x="${p.x}" y="${p.y+p.r+47}" text-anchor="middle" font-family="${MONO}" font-size="15" letter-spacing="2" fill="${p.light}">${p.label}</text>`).join('');
  const floor = Array.from({length:19},(_,i)=>`<path d="M640 325L${-1500+i*240} 620"/>`).join('')+
    [337,354,379,416,468,539,619].map(y=>`<path d="M0 ${y}H1280"/>`).join('');
  return svg(W,H,`
    <title>${esc(PROFILE.name)} — systems, worlds and ideas</title>
    <desc>Three luminous gateways: a circuit, a wireframe world and a constellation. Segmented rims rotate, depth rings travel outward, and energy flows across a reflective grid.</desc>
    <defs>${sweepDefs(W)}${defs}
      <linearGradient id="name-metal" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="#fff"/><stop offset=".38" stop-color="#c7e2f1"/>
        <stop offset=".48" stop-color="#809bb7"/><stop offset=".49" stop-color="#f4fbff"/>
        <stop offset=".7" stop-color="#dce9f7"/><stop offset="1" stop-color="#8ba6c9"/>
      </linearGradient>
      <linearGradient id="name-light"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#baf8ff" stop-opacity=".25"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset=".55" stop-color="#ead7ff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="name-mask">${nameText()}</clipPath>
      <clipPath id="frame"><rect width="${W}" height="${H}" rx="22"/></clipPath>
      <filter id="bloom" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
      <radialGradient id="sky"><stop stop-color="#10263a" stop-opacity=".65"/><stop offset="1" stop-color="#05060a" stop-opacity="0"/></radialGradient>
      <linearGradient id="floor-fade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#05060a" stop-opacity=".8"/><stop offset="1" stop-color="#05060a" stop-opacity="0"/></linearGradient>
    </defs>
    <g clip-path="url(#frame)">
      <rect width="${W}" height="${H}" fill="${C.bg}"/>
      <ellipse cx="640" cy="250" rx="680" ry="310" fill="url(#sky)"/>
      ${stars}
      <g fill="none" stroke="#314263" stroke-opacity=".32">${floor}</g>
      <rect y="325" width="${W}" height="160" fill="url(#floor-fade)"/>
      <g fill="none" stroke="${C.cyan}" stroke-width="1.5" stroke-opacity=".5" stroke-dasharray="9 111" class="portal-flow"><path d="M300 545Q460 285 640 543Q820 285 980 545"/></g>
      ${scene}
      <g font-family="${MONO}" font-size="13" fill="${C.muted}"><circle cx="30" cy="30" r="5" fill="${C.cyan}"/><text x="48" y="35">~/${esc(PROFILE.user)}</text><text x="1250" y="35" text-anchor="end">${esc(PROFILE.site)}</text></g>
      <g transform="translate(0 4)">${nameText('fill="#14243b" stroke="#243e5b" stroke-width="1"')}</g>
      ${nameText('fill="none" stroke="url(#sweep)" stroke-width="2" opacity=".3" filter="url(#bloom)"')}
      ${nameText('fill="url(#name-metal)" stroke="#d8f1ff" stroke-width=".45"')}
      <g clip-path="url(#name-mask)"><g class="name-sheen"><path d="M-95 85H-10L95 185H10Z" fill="url(#name-light)"/></g></g>
      <text x="640" y="207" text-anchor="middle" font-family="${MONO}" font-size="17" fill="${C.muted}">${esc(PROFILE.tagline)}</text>
      ${typed}
      <path d="M0 ${H-1}H1280" stroke="url(#sweep)" stroke-width="2" opacity=".7"/>
    </g><rect x=".5" y=".5" width="${W-1}" height="${H-1}" rx="22" fill="none" stroke="${C.line}"/>`.replace(/[ \t]+$/gm, ''),motion);
}

function terminal() {
  const W = 1280, LH = 34, top = 96, H = top + LINES.length * LH + 44;
  const rows = LINES.map(([k, v], i) => {
    const y = top + i * LH, t = (0.5 + i * 0.32).toFixed(2);
    return `<g class="reveal" style="animation-delay:${t}s">
      <text x="56" y="${y}" fill="${C.cyan}">${esc(k.padEnd(10))}</text><text x="190" y="${y}" fill="${C.text}">${esc(v)}</text></g>`;
  }).join("");
  // Logo: an "M" drawn as lit cells on a 9x7 grid.
  const M = ["100000001", "110000011", "101000101", "100101001", "100010001", "100000001", "100000001"];
  const gx = 960, gy = 92, cs = 26;
  const logo = M.map((row, yy) => [...row].map((c, xx) => {
    const lit = c === "1";
    return `<rect x="${gx + xx * cs}" y="${gy + yy * cs}" width="${cs - 5}" height="${cs - 5}" rx="4" fill="${lit ? "url(#sweep)" : C.line}" opacity="${lit ? 1 : 0.5}"></rect>`;
  }).join("")).join("");
  return svg(W, H, `
  <title>About Maxwell</title>
  <defs>${sweepDefs(W)}</defs>
  <rect width="${W}" height="${H}" rx="18" fill="${C.panel}"/>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${C.line}"/>
  <rect width="${W}" height="46" rx="18" fill="#10131c"/><rect y="28" width="${W}" height="18" fill="#10131c"/>
  <circle cx="28" cy="23" r="6" fill="#ff5f57"/><circle cx="48" cy="23" r="6" fill="#febc2e"/><circle cx="68" cy="23" r="6" fill="#28c840"/>
  <g font-family="${MONO}" font-size="14" xml:space="preserve">
    <text x="${W / 2}" y="29" text-anchor="middle" font-size="13" fill="${C.muted}">maxwell@${esc(PROFILE.host)}: ~</text>
    <text x="56" y="${top - LH}" fill="${C.gold}">$ whoami --verbose</text>
    ${rows}
    <text x="56" y="${top + LINES.length * LH + 6}" fill="${C.gold}">$</text>
    <rect class="cursor" x="78" y="${top + LINES.length * LH - 10}" width="10" height="19" fill="${C.cyan}"/>
  </g>
  ${logo}`);
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
  const W = 1280;
  return svg(W, 6, `<defs>${sweepDefs(W)}</defs><rect y="2" width="${W}" height="2" rx="1" fill="url(#sweep)" opacity=".8"/>`);
}

function domains() {
  const W = 1280, tw = 296, th = 150, gap = 16, x0 = 24, y0 = 24, H = y0 * 2 + th * 2 + gap;
  const tiles = DOMAINS.map((d, i) => {
    const x = x0 + (i % 4) * (tw + gap), y = y0 + Math.floor(i / 4) * (th + gap), t = (0.15 + i * 0.09).toFixed(2);
    return `<g>
      <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="16" fill="${C.panel}" stroke="${C.line}"/>
      <rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="16" fill="${d.accent}" fill-opacity=".05"/>
      <rect x="${x + 22}" y="${y + 24}" width="34" height="4" rx="2" fill="${d.accent}"></rect>
      <text x="${x + tw - 22}" y="${y + 32}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${d.accent}">${String(i + 1).padStart(2, "0")}</text>
      <text x="${x + 22}" y="${y + 66}" font-family="${SANS}" font-size="20" font-weight="700" fill="${C.text}">${esc(d.title)}</text>
      ${d.lines.map((l, k) => `<text x="${x + 22}" y="${y + 96 + k * 21}" font-family="${SANS}" font-size="14.5" fill="${C.muted}">${esc(l)}</text>`).join("")}</g>`;
  }).join("");
  return svg(W, H, `<title>What I do</title><rect width="${W}" height="${H}" rx="20" fill="${C.bg}"/>${tiles}`);
}

function stats() {
  const W = 1280, H = 160, col = W / STATS.length;
  const cells = STATS.map((st, i) => {
    const x = col * i + col / 2;
    return `<text x="${x}" y="78" text-anchor="middle" font-family="${SANS}" font-size="54" font-weight="800" fill="url(#sweep)">${esc(st.value)}</text>
      ${st.label.map((l, k) => `<text x="${x}" y="${108 + k * 17}" text-anchor="middle" font-family="${MONO}" font-size="12" letter-spacing="1.5" fill="${C.muted}">${esc(l)}</text>`).join("")}
      ${i ? `<line x1="${col * i}" y1="34" x2="${col * i}" y2="126" stroke="${C.line}"/>` : ""}`;
  }).join("");
  return svg(W, H, `<title>By the numbers</title><defs>${sweepDefs(W)}</defs><rect width="${W}" height="${H}" rx="18" fill="${C.panel}"/><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="none" stroke="${C.line}"/>${cells}`);
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

// Single source of truth for the profile page. Edit here, then run: node scripts/build.mjs
const GL = "https://gitlab.com/Maxwell333";
const GH = "https://github.com/iM4x3ll";

export const PROFILE = {
  user: "iM4x3ll",
  gitlab: "Maxwell333",
  host: "github",
  name: "MAXWELL NIXON",
  tagline: "systems  ·  operating systems  ·  games  ·  web  ·  local AI",
  typed: [
    "> three game engines, one process, one portal",
    "> a Linux distro that builds and boots from one command",
    "> a whole game launcher in 90 KB",
    "> local AI on one GPU, nothing leaves the house",
    "> IT for law firms and courtrooms, 9 to 5",
  ],
  site: "maxwellnixon.com",
};

export const LINES = [
  ["role", "IT technician by day, builder of odd software by night"],
  ["infra", "Windows fleets · Active Directory · courtroom IT · small-business servers"],
  ["systems", "C++ · Direct3D 9 · engine internals · reverse-engineered game code"],
  ["apps", "C# / .NET · WPF · WinForms · Python · PyQt"],
  ["web", "Next.js · TypeScript · Fastify · Elixir · PostgreSQL"],
  ["linux", "Arch · archiso · WSL2 · Hyper-V · Bash · PowerShell"],
  ["ai", "Ollama · Open WebUI · custom agents · a Python voice assistant"],
  ["lab", "Plex · Pi-hole · Nextcloud · Home Assistant · Tailscale"],
  ["rig", "Ryzen 7 9800X3D · RTX 5070 Ti · 45\" 240 Hz OLED ultrawide"],
  ["play", "sim racing · VR · modding RDR2, GTA and BeamNG"],
];

export const DOMAINS = [
  { accent: "#22d3ee", title: "Infrastructure & IT", lines: ["Windows fleets, Active Directory,", "courtroom setups, MSP ticket work."] },
  { accent: "#f472b6", title: "Systems programming", lines: ["Three game engines sharing one", "process and one Direct3D device."] },
  { accent: "#a855f7", title: "Operating systems", lines: ["My own Arch-based distro, built", "and booted by a single script."] },
  { accent: "#fb923c", title: "Desktop software", lines: ["Native Windows apps in C# and", "Python. One is a 90 KB launcher."] },
  { accent: "#38bdf8", title: "Web platforms", lines: ["Next.js sites, live data APIs,", "and a real-time chat backend."] },
  { accent: "#4ade80", title: "Local AI", lines: ["Self-hosted models, custom agents,", "and a voice assistant on one GPU."] },
  { accent: "#f5c451", title: "Game dev & modding", lines: ["A co-op Roblox game, engine mods,", "RDR2, GTA and BeamNG tinkering."] },
  { accent: "#f87171", title: "Home lab", lines: ["Media server, DNS filtering,", "private cloud and remote access."] },
];

export const STATS = [
  { value: "3", label: ["GAME ENGINES", "IN ONE PROCESS"] },
  { value: "90 KB", label: ["A WHOLE GAME", "LAUNCHER"] },
  { value: "1", label: ["COMMAND TO BUILD", "AND BOOT AN OS"] },
  { value: "35+", label: ["BROWSER TOOLS", "ON MY SITE"] },
  { value: "2", label: ["LIVE PUBLIC", "DEMOS"] },
];

export const CARDS = [
  {
    slug: "xport", accent: "#22d3ee", title: "XPort",
    lines: ["Walkable portals between GTA III, Vice City and San", "Andreas: three engines running in one process."],
    tags: ["C++", "Direct3D 9", "Engine internals"], href: `${GL}/xport`,
  },
  {
    slug: "maxwellos", accent: "#a855f7", title: "MaxwellOS",
    lines: ["My own Arch-based gaming distro: Steam and Proton", "preinstalled, verified ISO build, one-command VM deploy."],
    tags: ["Arch Linux", "archiso", "Bash"], href: `${GL}/maxwellos`,
  },
  {
    slug: "launcher", accent: "#f472b6", title: "Game Library",
    lines: ["A complete game launcher in a single 90 KB file.", "Spring-physics scrolling, controller support, no installs."],
    tags: ["C#", "WinForms", "Zero dependencies"], href: `${GL}/max-launcher`,
  },
  {
    slug: "ouija", accent: "#c084fc", title: "Ouija",
    lines: ["Real-time community chat on the BEAM: Erlang, Elixir", "and Gleam, with voice, roles and billing."],
    tags: ["Elixir", "Gleam", "LiveKit"], href: "https://ouija.one",
  },
  {
    slug: "riftfall", accent: "#38bdf8", title: "Riftfall",
    lines: ["A co-op Roblox game: raid an unstable dimension,", "bank the loot, escape before it collapses."],
    tags: ["Luau", "Roblox", "Server-authoritative"], href: `${GL}/riftfall`,
  },
  {
    slug: "powder", accent: "#fb923c", title: "Powder Lab",
    lines: ["Falling-sand chemistry sandbox with its own software", "renderer. Sand piles, water flows, things react."],
    tags: ["C#", "WPF", "Simulation"], href: `${GL}/powder-lab`,
  },
  {
    slug: "paradise", accent: "#4ade80", title: "Paradise",
    lines: ["A featherweight radio player with lossless audio and", "a soft-spoken neural DJ between tracks."],
    tags: ["Python", "PyQt6", "libVLC"], href: `${GL}/paradise-radio`,
  },
  {
    slug: "site", accent: "#f5c451", title: "maxwellnixon.com",
    lines: ["Portfolio that doubles as a workshop: 35+ tools, live", "data widgets, a terminal and a browser arcade."],
    tags: ["Next.js", "TypeScript", "Vercel"], href: "https://www.maxwellnixon.com",
  },
];

export { GL, GH };

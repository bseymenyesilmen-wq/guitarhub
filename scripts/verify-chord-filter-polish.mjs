import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "akor-kutuphanesi", "page.tsx"), "utf8");

const required = [
  'rounded-[2rem] border border-white/10 bg-zinc-950/70 p-3',
  'rounded-[1.7rem] border border-red-500/15 bg-gradient-to-br',
  'rounded-[1.45rem] border border-white/10 bg-black/35',
  'rounded-[1.35rem] bg-black/25 p-1.5',
  'rounded-[1.1rem] px-4 py-2 text-sm font-black',
  '[&::-webkit-scrollbar]:hidden',
];
const forbidden = [
  'space-y-3 bg-zinc-950/95 py-3',
  'rounded-2xl border border-zinc-800 bg-zinc-900 p-4',
  'min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-bold',
];

const missing = required.filter((snippet) => !page.includes(snippet));
const bad = forbidden.filter((snippet) => page.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing chord filter polish snippets:\n${missing.join("\n")}`);
  if (bad.length) console.error(`Old square chord filter snippets remain:\n${bad.join("\n")}`);
  process.exit(1);
}

console.log("Chord filter shell is softened and rounded.");

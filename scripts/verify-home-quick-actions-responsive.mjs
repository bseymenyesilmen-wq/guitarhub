import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "page.tsx"), "utf8");

const forbidden = [
  "const QUICK_ACTIONS",
  "QUICK_ACTIONS.map",
  "Akor ve söz bul, beğendiğini repertuvarına ekle.",
  "Bilmediğin akorun basışını gör.",
  "Solo ve klavye çalışması için gamlara bak.",
];

const present = forbidden.filter((snippet) => page.includes(snippet));
if (present.length) {
  console.error(`Removed desktop quick actions still present:\n${present.join("\n")}`);
  process.exit(1);
}

console.log("Homepage quick action cards are removed.");

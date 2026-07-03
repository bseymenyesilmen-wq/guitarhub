import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "page.tsx"), "utf8");

const required = [
  'section className="mt-8 hidden gap-4 lg:grid lg:grid-cols-4"',
  "QUICK_ACTIONS.map",
];

const missing = required.filter((snippet) => !page.includes(snippet));
if (missing.length) {
  console.error(`Missing responsive quick actions snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Homepage quick action cards are desktop-only.");

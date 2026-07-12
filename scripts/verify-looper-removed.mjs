import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const nav = readFileSync(join(root, "app", "components", "AppNav.tsx"), "utf8");
const forbidden = ["/looper", "Looper"];
const bad = forbidden.filter((snippet) => nav.includes(snippet));
const routeExists = existsSync(join(root, "app", "looper", "page.tsx"));
const oldTestExists = existsSync(join(root, "scripts", "verify-looper-feature.mjs"));
if (bad.length || routeExists || oldTestExists) {
  if (bad.length) console.error(`Looper still appears in nav: ${bad.join(", ")}`);
  if (routeExists) console.error("Looper route still exists");
  if (oldTestExists) console.error("Old looper feature test still exists");
  process.exit(1);
}
console.log("Looper section is fully removed from route and navigation.");

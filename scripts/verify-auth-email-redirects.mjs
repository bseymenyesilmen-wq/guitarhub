import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const register = readFileSync(join(root, "app", "kayit", "page.tsx"), "utf8");
const reset = readFileSync(join(root, "app", "sifre-sifirla", "page.tsx"), "utf8");

const required = [
  [register, "const AUTH_REDIRECT_URL = \"https://guitarhub47.netlify.app/giris\"", "register production auth redirect"],
  [register, "emailRedirectTo: AUTH_REDIRECT_URL", "signup confirmation redirect override"],
  [reset, "const AUTH_REDIRECT_URL = \"https://guitarhub47.netlify.app/giris\"", "reset production auth redirect"],
  [reset, "redirectTo: AUTH_REDIRECT_URL", "password reset redirect override"],
];

const forbidden = [
  [register + reset, "window.location.origin", "auth email links must not inherit localhost/VPS preview origin"],
  [register + reset, "localhost", "auth email links must not point to localhost"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing auth redirect snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden auth redirect snippets:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Supabase auth email redirects use the production GuitarHub URL.");

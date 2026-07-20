import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const register = readFileSync(join(root, "app", "kayit", "page.tsx"), "utf8");
const reset = readFileSync(join(root, "app", "sifre-sifirla", "page.tsx"), "utf8");

const required = [
  [register, "fetch(\"/api/auth/register\"", "register uses username API instead of signup email"],
  [register, "usernameToAuthEmail", "register signs in with generated internal email"],
  [reset, "const AUTH_REDIRECT_URL = \"https://guitarhub47.netlify.app/giris\"", "legacy reset production auth redirect remains for old email accounts"],
];

const forbidden = [
  [register, "emailRedirectTo", "signup confirmation redirect should not be in username registration"],
  [register, "supabase.auth.signUp", "client email signup should not be used"],
  [register, "localhost", "auth links must not point to localhost"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing auth redirect/username snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden auth snippets:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Username auth avoids signup confirmation emails; legacy reset redirects stay production-safe.");

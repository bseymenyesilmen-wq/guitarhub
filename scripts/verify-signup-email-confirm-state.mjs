import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const register = readFileSync(join(root, "app", "kayit", "page.tsx"), "utf8");
const registerApi = readFileSync(join(root, "app", "api", "auth", "register", "route.ts"), "utf8");

const required = [
  [register, "Kullanıcı Adı", "signup username copy"],
  [register, "Kayıt oluşturuldu. Kullanıcı adın ve şifrenle giriş yapabilirsin.", "signup no-mail fallback message"],
  [registerApi, "email_confirm: true", "admin-created users are confirmed immediately"],
];

const forbidden = [
  [register, "Doğrulama maili", "confirmation email copy"],
  [register, "Supabase mail doğrulaması", "old Supabase mail-disabled copy"],
  [register, "emailRedirectTo", "email confirmation redirect"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing signup no-email snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden signup email snippets remain:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Signup no longer depends on confirmation email state.");

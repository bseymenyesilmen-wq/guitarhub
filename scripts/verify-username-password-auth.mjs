import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const registerPage = readFileSync(join(root, "app", "kayit", "page.tsx"), "utf8");
const loginPage = readFileSync(join(root, "app", "giris", "page.tsx"), "utf8");
const registerApi = readFileSync(join(root, "app", "api", "auth", "register", "route.ts"), "utf8");
const helper = readFileSync(join(root, "lib", "authUsername.ts"), "utf8");

const required = [
  [helper, "usernameToAuthEmail", "username internal email helper"],
  [helper, "guitarhub.local", "internal auth email domain"],
  [registerApi, "admin.auth.admin.createUser", "server-side admin registration when secret exists"],
  [registerApi, "email_confirm: true", "admin registration bypasses confirm email when secret exists"],
  [registerApi, "publicClient.auth.signUp", "public fallback registration when Netlify secret is missing"],
  [registerApi, "mode: \"public-signup\"", "public fallback response"],
  [registerApi, "SUPABASE_SECRET_KEY", "server-side service key supported"],
  [registerPage, "fetch(\"/api/auth/register\"", "signup uses API route"],
  [registerPage, "label=\"İsim\"", "signup asks name"],
  [registerPage, "label=\"Kullanıcı Adı\"", "signup asks username"],
  [registerPage, "label=\"Şifre\"", "signup asks password"],
  [loginPage, "label=\"Kullanıcı Adı\"", "login uses username"],
  [loginPage, "usernameToAuthEmail", "login maps username to auth email"],
];

const forbidden = [
  [registerPage, "emailRedirectTo", "signup email confirmation redirect"],
  [registerPage, "Doğrulama maili", "signup confirmation mail copy"],
  [registerPage, "label=\"E-posta\"", "signup email input"],
  [loginPage, "label=\"E-posta\"", "login email input"],
  [loginPage, "Şifremi Unuttum", "password reset email link"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing username auth snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden email auth snippets remain:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Username/password auth is wired without confirmation email UI.");

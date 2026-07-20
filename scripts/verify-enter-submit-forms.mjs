import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const files = {
  login: readFileSync(join(root, "app", "giris", "page.tsx"), "utf8"),
  signup: readFileSync(join(root, "app", "kayit", "page.tsx"), "utf8"),
  reset: readFileSync(join(root, "app", "sifre-sifirla", "page.tsx"), "utf8"),
  search: readFileSync(join(root, "app", "sarki-ara", "page.tsx"), "utf8"),
  chatbot: readFileSync(join(root, "app", "components", "ChatbotWidget.tsx"), "utf8"),
};

const required = [
  [files.login, "<form onSubmit={handleSubmit}", "login form submit"],
  [files.login, "<GhButton type=\"submit\"", "login submit button"],
  [files.signup, "<form onSubmit={handleSubmit}", "signup form submit"],
  [files.signup, "<GhButton type=\"submit\"", "signup submit button"],
  [files.reset, "<form onSubmit={handleSubmit}", "password reset form submit"],
  [files.reset, "<GhButton type=\"submit\"", "password reset submit button"],
  [files.search, "<form onSubmit={handleSearchSubmit}", "song search form submit"],
  [files.search, "type=\"submit\"", "song search submit button"],
  [files.chatbot, "<form onSubmit={handleSubmit}", "Yoda chat form submit"],
];

const forbidden = [
  [files.search, "if (event.key === \"Enter\") searchSong();", "unprevented song search Enter key handler"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const bad = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || bad.length) {
  if (missing.length) console.error(`Missing Enter-submit snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (bad.length) console.error(`Forbidden Enter-submit snippets remain:\n${bad.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Primary GuitarHub inputs submit on Enter through real forms.");

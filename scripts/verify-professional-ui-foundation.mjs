import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const read = (path) => readFileSync(join(root, path), "utf8");

const files = {
  button: read("app/components/ui/GhButton.tsx"),
  card: read("app/components/ui/GhCard.tsx"),
  input: read("app/components/ui/GhInput.tsx"),
  empty: read("app/components/ui/GhEmptyState.tsx"),
  header: read("app/components/ui/GhSectionHeader.tsx"),
  giris: read("app/giris/page.tsx"),
  kayit: read("app/kayit/page.tsx"),
  reset: read("app/sifre-sifirla/page.tsx"),
  yoda: read("app/components/ChatbotWidget.tsx"),
};

const required = [
  [files.button, "export function GhButton", "shared button component"],
  [files.card, "export function GhCard", "shared card component"],
  [files.input, "export function GhInput", "shared input component"],
  [files.empty, "export function GhEmptyState", "shared empty state component"],
  [files.header, "export function GhSectionHeader", "shared section header component"],
  [files.giris, "Giriş Yap", "Turkish login copy"],
  [files.giris, "GuitarHub", "login brand"],
  [files.kayit, "Hesap Oluştur", "Turkish register copy"],
  [files.kayit, "Babayaga Tarafından Yaratıldı", "premium register hero"],
  [files.reset, "Şifre Sıfırla", "Turkish reset copy"],
  [files.yoda, "genel konular", "Yoda welcome matches open scope"],
];

const forbidden = [
  [files.giris + files.kayit + files.reset, ">Giris", "ASCII-only Giris visible copy"],
  [files.giris + files.kayit + files.reset, "\"Giris", "ASCII-only Giris string copy"],
  [files.giris + files.kayit + files.reset, ">Sifre", "ASCII-only Sifre visible copy"],
  [files.giris + files.kayit + files.reset, "\"Sifre", "ASCII-only Sifre string copy"],
  [files.giris + files.kayit + files.reset, ">Kayit", "ASCII-only Kayit visible copy"],
  [files.giris + files.kayit + files.reset, "\"Kayit", "ASCII-only Kayit string copy"],
  [files.yoda, "Müzik dışı konulara girmem", "stale Yoda scope copy"],
  [files.giris, "Gitar Merkezine Dön", "removed login hero section"],
  [files.giris + files.kayit + files.reset, "burak@example.com", "removed Burak email example"],
  [files.kayit, "placeholder=\"Burak\"", "removed Burak username example"],
  [files.giris + files.kayit, "••••", "removed password dots placeholder"],
  [files.kayit, "En az 6 karakter", "removed password helper placeholder"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet));
const presentForbidden = forbidden.filter(([content, snippet]) => content.includes(snippet));
if (missing.length || presentForbidden.length) {
  if (missing.length) console.error(`Missing professional UI snippets:\n${missing.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  if (presentForbidden.length) console.error(`Forbidden stale UI snippets:\n${presentForbidden.map(([, snippet, label]) => `${label}: ${snippet}`).join("\n")}`);
  process.exit(1);
}

console.log("Professional UI foundation is wired.");

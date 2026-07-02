import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const detail = readFileSync(join(root, "app", "sarki-ogren", "[tabId]", "page.tsx"), "utf8");
const storageSqlPath = join(root, "supabase", "migrations", "20260702_learning_tabs_storage_bucket.sql");
const storageSql = existsSync(storageSqlPath) ? readFileSync(storageSqlPath, "utf8") : "";

const required = [
  [detail, "handleGpFileUpload"],
  [detail, "accept=\".gp,.gp3,.gp4,.gp5,.gpx\""],
  [detail, "supabase.storage.from(\"learning-tabs\").upload"],
  [detail, "getPublicUrl"],
  [detail, "learning_tabs"],
  [detail, "gp_file_url"],
  [detail, "Yükleniyor"],
  [detail, "GP dosyası yükle"],
  [detail, "setUploadingGpFile"],
  [storageSql, "insert into storage.buckets"],
  [storageSql, "learning-tabs"],
  [storageSql, "storage.objects"],
  [storageSql, "Users can upload own learning tab files"],
  [storageSql, "Public can read learning tab files"],
];

const missing = required.filter(([content, snippet]) => !content.includes(snippet)).map(([, snippet]) => snippet);
if (missing.length) {
  console.error(`Missing GP upload snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("GP file upload to Supabase Storage is wired.");

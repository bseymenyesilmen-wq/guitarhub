import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "sarki-ogren", "page.tsx"), "utf8");

const required = [
  "createPanelOpen",
  "setCreatePanelOpen",
  "newTabForm",
  "setNewTabForm",
  "handleCreateLearningTab",
  "slugifyLearningTab",
  "Yeni Tab Oluştur",
  "Şarkı adı",
  "Sanatçı",
  "Enstrümanlar",
  "Akort",
  "BPM",
  "Tab metni",
  "Public",
  "Private",
  "Taslak",
  "from(\"learning_tabs\").insert",
  "from(\"learning_tab_revisions\").insert",
  "tab_snapshot",
  "contributor_id",
  "source_type: \"user\"",
  "window.location.href = `/sarki-ogren/${createdTab.id}`",
];

const missing = required.filter((snippet) => !page.includes(snippet));
if (missing.length) {
  console.error(`Missing create learning tab snippets:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log("Create learning tab flow is wired.");

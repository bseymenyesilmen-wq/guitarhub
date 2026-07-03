import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const page = readFileSync(join(__dirname, "..", "app", "sarki-ogren", "page.tsx"), "utf8");

const required = [
  "Songsterr Bridge",
  "buildSongsterrSearchUrl",
  "songsterrBridgeUrl",
  "songsterrQuery",
  "Songsterr’da Ara",
  "target=\"_blank\"",
  "rel=\"noopener noreferrer\"",
  "https://www.songsterr.com/?pattern=",
  "GuitarHub’da yoksa Songsterr’da aç",
  "Veriyi kopyalamadan public Songsterr araması açar",
];

const forbidden = [
  "/a/ra/songs.json",
  "downloadUrl",
  "revision?.downloadUrl",
  "/api/tab-fetch",
];

const missing = required.filter((snippet) => !page.includes(snippet));
const forbiddenFound = forbidden.filter((snippet) => page.includes(snippet));

if (missing.length || forbiddenFound.length) {
  if (missing.length) console.error(`Missing Songsterr bridge snippets:\n${missing.join("\n")}`);
  if (forbiddenFound.length) console.error(`Forbidden downloader snippets found:\n${forbiddenFound.join("\n")}`);
  process.exit(1);
}

console.log("Songsterr bridge search is wired without downloader endpoints.");

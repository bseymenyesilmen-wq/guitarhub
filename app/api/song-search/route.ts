import axios from "axios";
import * as cheerio from "cheerio";
import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { type SongArtistResult, type SongSearchListItem, type SongSearchResponse } from "@/lib/songSearch";

type SearchRequest = {
  query?: string;
  title?: string;
  artist?: string;
  source?: string;
};

type Provider = "repertuarim" | "ultimate-guitar" | "uakor" | "akorlar";

const NOT_FOUND_MESSAGE = "Şarkı bulunamadı.";
const REPERTUARIM_URL = "https://www.repertuarim.com";
const ULTIMATE_GUITAR_URL = "https://www.ultimate-guitar.com";
const ULTIMATE_TABS_URL = "https://tabs.ultimate-guitar.com";
const UAKOR_URL = "https://uakor.com";
const AKORLAR_URL = "https://akorlar.com";
const ULTIMATE_GUITAR_API_URL = "https://api.ultimate-guitar.com/api/v1";
const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

const SIMILAR_ARTISTS: Record<string, string[]> = {
  duman: ["Mor ve Ötesi", "Manga", "Teoman", "Şebnem Ferah", "Yüzyüzeyken Konuşuruz"],
  "mor ve otesi": ["Duman", "Manga", "Teoman", "Şebnem Ferah", "Athena"],
  manga: ["Duman", "Mor ve Ötesi", "Athena", "Şebnem Ferah", "Model"],
  teoman: ["Duman", "Mor ve Ötesi", "Şebnem Ferah", "Yüksek Sadakat", "Pinhani"],
  radiohead: ["Nirvana", "Arctic Monkeys", "Coldplay", "Muse", "The Smashing Pumpkins"],
  nirvana: ["Radiohead", "Pearl Jam", "Foo Fighters", "Alice In Chains", "Soundgarden"],
  "chris isaak": ["Radiohead", "Nirvana", "Arctic Monkeys", "Coldplay", "The Cranberries"],
  "arctic monkeys": ["Radiohead", "The Strokes", "Muse", "Nirvana", "Coldplay"],
};

const FOREIGN_PLAY_NEXT_QUERIES = ["Radiohead Creep", "Chris Isaak Wicked Game", "Arctic Monkeys Do I Wanna Know", "Nirvana Heart Shaped Box", "Coldplay Yellow"];
const TURKISH_PLAY_NEXT_QUERIES = ["Duman Senden Daha Guzel", "Mor ve Ötesi Bir Derdim Var", "Manga Bir Kadin Cizeceksin", "Teoman Paramparca", "Şebnem Ferah Sil Baştan"];

function cleanPreContent(content: string) {
  return content
    .replace(/\t/g, "    ")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

function cleanAnchorText(text: string) {
  return text.replace(/\s+/g, " ").trim().replace(/^[ASR](?=[A-ZÇĞİÖŞÜ0-9])/u, "");
}

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value: string) {
  return normalizeText(value).replace(/\s+/g, "-");
}

function absoluteUrl(href: string, baseUrl = REPERTUARIM_URL) {
  return href.startsWith("http") ? href : `${baseUrl}${href.startsWith("/") ? "" : "/"}${href}`;
}

function providerForUrl(url: string): Provider {
  if (url.startsWith("ug:")) return "ultimate-guitar";
  if (url.startsWith(ULTIMATE_GUITAR_URL) || url.startsWith(ULTIMATE_TABS_URL)) return "ultimate-guitar";
  if (url.includes("uakor.com")) return "uakor";
  if (url.includes("akorlar.com")) return "akorlar";
  return "repertuarim";
}

function parseSongTitle(value: string, fallbackArtist = "") {
  const cleaned = cleanAnchorText(value).replace(/\s+-\s+Akor.*$/i, "").replace(/\s+CHORDS.*$/i, "").trim();
  const [artistPart, ...titleParts] = cleaned.split(" - ");
  const title = titleParts.join(" - ").trim();
  if (artistPart && title) return { artist: artistPart.trim(), title };
  return { artist: fallbackArtist || "Bilinmeyen Sanatçı", title: cleaned || "Şarkı" };
}

function parseRepertuarimSongLink(href: string, text: string): SongSearchListItem | null {
  if (!href.includes("/akor/")) return null;
  const parsed = parseSongTitle(text);
  if (!parsed.artist || !parsed.title) return null;
  return { ...parsed, provider: "repertuarim", source: absoluteUrl(href, REPERTUARIM_URL) };
}

function parseRepertuarimArtistLink(href: string, text: string): SongArtistResult | null {
  if (!href.includes("/akor-tab/")) return null;
  const name = cleanAnchorText(text).replace(/^S(?=[A-ZÇĞİÖŞÜ])/u, "").trim();
  if (!name) return null;
  return { name, source: absoluteUrl(href, REPERTUARIM_URL) };
}

function parseAkorlarSongLink(href: string, text: string, fallbackArtist = ""): SongSearchListItem | null {
  if (!href.includes("akorlar.com") && href.startsWith("http")) return null;
  if (href.includes("#") || href.includes("giris") || href.includes("google")) return null;
  const titleAttr = cleanAnchorText(text).replace(/\s+akor$/i, "");
  if (!titleAttr.includes(" - ")) return null;
  const parsed = parseSongTitle(titleAttr, fallbackArtist);
  if (!parsed.artist || !parsed.title) return null;
  return { ...parsed, provider: "akorlar", source: absoluteUrl(href, AKORLAR_URL) };
}

function parseUakorSongLink(href: string, text: string, titleAttr = ""): SongSearchListItem | null {
  if (!href.includes("/akor/")) return null;
  const sourceText = titleAttr || text;
  const cleaned = cleanAnchorText(sourceText).replace(/\s+Akor(?:ları)?$/i, "").trim();
  const parsed = parseSongTitle(cleaned);
  if (!parsed.artist || !parsed.title || parsed.title === parsed.artist) return null;
  return { ...parsed, provider: "uakor", source: absoluteUrl(href, UAKOR_URL) };
}

function dedupeSongs(songs: SongSearchListItem[]) {
  const seen = new Set<string>();
  return songs.filter((song) => {
    const key = `${normalizeText(song.artist)}-${normalizeText(song.title)}-${song.provider ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeArtists(artists: SongArtistResult[]) {
  const seen = new Set<string>();
  return artists.filter((artist) => {
    const key = normalizeText(artist.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractArtistFromTitle(scrapedTitle: string, fallbackArtist: string) {
  if (fallbackArtist) return fallbackArtist;
  return parseSongTitle(scrapedTitle).artist || "Bilinmeyen Sanatçı";
}

function extractUakorPreContent(html: string) {
  const escapedPreMatch = html.match(/\\u003cpre[\s\S]*?\\u003c\/pre\\u003e/);
  if (escapedPreMatch) {
    const escapedHtml = escapedPreMatch[0]
      .replace(/\\u003c/g, "<")
      .replace(/\\u003e/g, ">")
      .replace(/\\\\r\\\\n/g, "\n")
      .replace(/\\\\n/g, "\n")
      .replace(/\\\\\"/g, '"');
    const $escaped = cheerio.load(escapedHtml);
    const preText = $escaped("pre").first().text();
    if (preText.trim()) return cleanPreContent(preText);
  }

  const matches = [...html.matchAll(/\\"content\\":\\"((?:\\\\.|[^\\"\\\\])*)\\"/g)];
  const decodedBlocks = matches
    .map((match) => {
      try {
        return JSON.parse(`"${match[1]}"`) as string;
      } catch {
        return "";
      }
    })
    .filter((value) => value.includes("<pre"))
    .sort((a, b) => b.length - a.length);
  const decoded = decodedBlocks[0] ?? "";
  if (!decoded) return "";
  const $ = cheerio.load(decoded);
  return cleanPreContent($("pre").first().text() || decoded.replace(/<[^>]+>/g, ""));
}

function stripUltimateGuitarMarkup(content: string) {
  return cleanPreContent(
    content
      .replace(/\[\/?tab\]/g, "")
      .replace(/\[ch\]/g, "")
      .replace(/\[\/ch\]/g, "")
      .replace(/\r\n/g, "\n"),
  );
}

function isUltimateGuitarTabBlock(block: string) {
  const lines = block.split("\n").map((line) => line.trimEnd());
  const tabStaffLines = lines.filter((line) => /^\s*(?:e|B|G|D|A|E)\|[-0-9hHpPsSbBrR/\\~xX()|\s.]+$/.test(line));
  const dashedStaffLines = lines.filter((line) => /^\s*[-|0-9hHpPsSbBrR/\\~xX()\s.]{12,}$/.test(line) && line.includes("|"));
  return tabStaffLines.length >= 2 || dashedStaffLines.length >= 3;
}

function splitUltimateGuitarContent(content: string) {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lyricsBlocks: string[] = [];
  const tabBlocks: string[] = [];
  const outsideContent = stripUltimateGuitarMarkup(normalized.replace(/\[tab\][\s\S]*?\[\/tab\]/gi, "\n"));

  for (const match of normalized.matchAll(/\[tab\]([\s\S]*?)\[\/tab\]/gi)) {
    const cleanedBlock = stripUltimateGuitarMarkup(match[1]);
    if (!cleanedBlock) continue;
    if (isUltimateGuitarTabBlock(cleanedBlock)) {
      tabBlocks.push(cleanedBlock);
    } else {
      lyricsBlocks.push(cleanedBlock);
    }
  }

  const lyricsAndChords = cleanPreContent([outsideContent, ...lyricsBlocks].filter(Boolean).join("\n\n"));
  const tab = cleanPreContent(tabBlocks.filter(Boolean).join("\n\n"));
  return { lyricsAndChords, tab };
}

function buildUltimateGuitarHeaders() {
  const clientId = randomBytes(8).toString("hex");
  const now = new Date();
  const utcDateHour = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}:${now.getUTCHours()}`;
  const apiKey = createHash("md5").update(`${clientId}${utcDateHour}createLog()`).digest("hex");
  return {
    "Accept-Charset": "utf-8",
    Accept: "application/json",
    "User-Agent": "UGT_ANDROID/4.11.1 (Pixel; 8.1.0)",
    Connection: "close",
    "X-UG-CLIENT-ID": clientId,
    "X-UG-API-KEY": apiKey,
  };
}

type UltimateGuitarTab = {
  id: number;
  song_name: string;
  artist_name: string;
  type?: string;
  content?: string;
  tonality_name?: string;
  capo?: number | string;
  urlWeb?: string;
  rating?: number;
  recommended?: UltimateGuitarTab[];
  album_cover?: { app_album_cover?: { small?: string } };
  artist_cover?: { app_artist_cover?: { small?: string } };
};

function buildUltimateGuitarRecommendations(tab: UltimateGuitarTab) {
  return dedupeSongs(
    (tab.recommended ?? [])
      .filter((item) => item.id && item.song_name && item.artist_name)
      .map((item) => ({
        title: item.song_name,
        artist: item.artist_name,
        source: `ug:${item.id}`,
        provider: "ultimate-guitar",
        cover: item.album_cover?.app_album_cover?.small ?? item.artist_cover?.app_artist_cover?.small,
      })),
  ).slice(0, 6);
}

function isLikelyForeignSong(artist: string, title: string) {
  const text = normalizeText(`${artist} ${title}`);
  const turkishMarkers = ["duman", "mor ve otesi", "manga", "teoman", "sebnem", "yuksek sadakat", "pinhani", "athena", "model", "yuzyuzeyken"];
  if (turkishMarkers.some((marker) => text.includes(marker))) return false;
  return /^[a-z0-9\s]+$/.test(text) && !/[çğıöşü]/i.test(`${artist} ${title}`);
}

async function searchUltimateGuitarFirst(query: string) {
  const songs = await searchUltimateGuitar(query).catch(() => []);
  return songs[0] ?? null;
}

async function buildSystemWideRecommendations(artist: string, title: string, existing: SongSearchListItem[] = []) {
  const isForeign = isLikelyForeignSong(artist, title);
  const recommendations: SongSearchListItem[] = isForeign ? [...existing] : [];
  const artistKey = normalizeText(artist);
  const querySeeds = [
    artist ? `${artist}` : "",
    ...(SIMILAR_ARTISTS[artistKey] ?? []).map((similarArtist) => `${similarArtist}`),
    ...(isForeign ? FOREIGN_PLAY_NEXT_QUERIES : TURKISH_PLAY_NEXT_QUERIES),
  ].filter(Boolean);

  for (const seed of querySeeds) {
    if (recommendations.length >= 6) break;
    const result = await searchUltimateGuitarFirst(seed);
    if (result && normalizeText(result.title) !== normalizeText(title)) recommendations.push(result);
  }

  return dedupeSongs(recommendations).filter((song) => normalizeText(song.title) !== normalizeText(title)).slice(0, 6);
}

async function getUltimateGuitarJson<T>(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const response = await axios.get<T>(`${ULTIMATE_GUITAR_API_URL}${path}?${query.toString()}`, {
    headers: buildUltimateGuitarHeaders(),
    timeout: 12_000,
    validateStatus: (status) => status >= 200 && status < 400,
  });
  return response.data;
}

function ultimateGuitarTabIdFromSource(source: string) {
  if (source.startsWith("ug:")) return Number(source.slice(3));
  const match = source.match(/-(\d+)(?:\?.*)?$/);
  return match ? Number(match[1]) : 0;
}

async function getHtml(url: string, referer = REPERTUARIM_URL) {
  const response = await axios.get<string>(url, {
    headers: { ...REQUEST_HEADERS, Referer: referer },
    timeout: 12_000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
  });
  return response.data;
}

async function fetchRepertuarimSongByUrl(songUrl: string, fallbackArtist = ""): Promise<SongSearchResponse> {
  if (!songUrl.startsWith(REPERTUARIM_URL) || !songUrl.includes("/akor/")) return { found: false, message: NOT_FOUND_MESSAGE };
  const html = await getHtml(songUrl, REPERTUARIM_URL);
  const $songPage = cheerio.load(html);
  const scrapedTitle = $songPage("h1").text().trim() || "Şarkı";
  const defaultKey = $songPage("div#default-key").attr("data-key") || "";
  const rawPreContent = $songPage("pre#key.chords").text() || $songPage("pre.chords").text() || $songPage("pre").first().text();
  const fullPreContent = cleanPreContent(rawPreContent);
  if (!fullPreContent) return { found: false, message: "Şarkı içeriği boş veya okunamadı." };
  const artist = extractArtistFromTitle(scrapedTitle, fallbackArtist);
  return {
    found: true,
    song: {
      title: scrapedTitle,
      artist,
      key: defaultKey,
      capo: "0",
      chords: fullPreContent,
      lyrics: fullPreContent,
      source: songUrl,
      provider: "Repertuarım",
      recommendations: await buildSystemWideRecommendations(artist, scrapedTitle),
    },
  };
}

async function fetchUakorSongByUrl(songUrl: string, fallbackArtist = ""): Promise<SongSearchResponse> {
  if (!songUrl.startsWith(UAKOR_URL) || !songUrl.includes("/akor/")) return { found: false, message: NOT_FOUND_MESSAGE };
  const html = await getHtml(songUrl, UAKOR_URL);
  const $ = cheerio.load(html);
  const heading = $("title").text().replace(" | uAkor", "").trim();
  const content = extractUakorPreContent(html);
  if (!content) return { found: false, message: NOT_FOUND_MESSAGE };
  const parsed = parseSongTitle(heading, fallbackArtist);
  const toneMatch = html.match(/\\"tone\\":\\"([^\\"]*)/);
  const artist = parsed.artist || fallbackArtist;
  return {
    found: true,
    song: {
      title: parsed.title,
      artist,
      key: toneMatch?.[1] ?? "",
      capo: "0",
      chords: content,
      lyrics: content,
      source: songUrl,
      provider: "uAkor",
      recommendations: await buildSystemWideRecommendations(artist, parsed.title),
    },
  };
}

async function fetchAkorlarSongByUrl(songUrl: string, fallbackArtist = ""): Promise<SongSearchResponse> {
  if (!songUrl.startsWith(AKORLAR_URL)) return { found: false, message: NOT_FOUND_MESSAGE };
  const html = await getHtml(songUrl, AKORLAR_URL);
  const $ = cheerio.load(html);
  const heading = $("h1").first().text().trim() || $("title").text().trim();
  const content = cleanPreContent($("pre").first().text());
  if (!content) return { found: false, message: NOT_FOUND_MESSAGE };
  const parsed = parseSongTitle(heading.replace(/\s+Akor.*$/i, ""), fallbackArtist);
  const keyText = $("body").text().match(/Orjinal Ton:\s*([A-G][#b]?)/i)?.[1] ?? "";
  const artist = parsed.artist || fallbackArtist;
  return {
    found: true,
    song: {
      title: parsed.title,
      artist,
      key: keyText,
      capo: "0",
      chords: content,
      lyrics: content,
      source: songUrl,
      provider: "Akorlar.com",
      recommendations: await buildSystemWideRecommendations(artist, parsed.title),
    },
  };
}

async function fetchUltimateGuitarSongByUrl(songUrl: string, fallbackArtist = ""): Promise<SongSearchResponse> {
  const tabId = ultimateGuitarTabIdFromSource(songUrl);
  if (!tabId) return { found: false, message: NOT_FOUND_MESSAGE };

  const tab = await getUltimateGuitarJson<UltimateGuitarTab>("/tab/info", {
    tab_id: tabId,
    tab_access_type: "private",
  });
  const splitContent = splitUltimateGuitarContent(tab.content ?? "");
  if (!splitContent.lyricsAndChords && !splitContent.tab) return { found: false, message: NOT_FOUND_MESSAGE };
  const existingRecommendations = buildUltimateGuitarRecommendations(tab);

  return {
    found: true,
    song: {
      title: tab.song_name || "Şarkı",
      artist: tab.artist_name || fallbackArtist || "Bilinmeyen Sanatçı",
      key: tab.tonality_name ?? "",
      capo: tab.capo ? String(tab.capo) : "0",
      chords: splitContent.lyricsAndChords,
      lyrics: splitContent.lyricsAndChords,
      tab: splitContent.tab,
      source: tab.urlWeb || `ug:${tabId}`,
      provider: "Ultimate Guitar",
      recommendations: await buildSystemWideRecommendations(tab.artist_name || fallbackArtist || "", tab.song_name || "", existingRecommendations),
    },
  };
}

async function fetchSongByUrl(songUrl: string, fallbackArtist = ""): Promise<SongSearchResponse> {
  try {
    const provider = providerForUrl(songUrl);
    if (provider === "uakor") return await fetchUakorSongByUrl(songUrl, fallbackArtist);
    if (provider === "akorlar") return await fetchAkorlarSongByUrl(songUrl, fallbackArtist);
    if (provider === "ultimate-guitar") return await fetchUltimateGuitarSongByUrl(songUrl, fallbackArtist);
    return await fetchRepertuarimSongByUrl(songUrl, fallbackArtist);
  } catch {
    return { found: false, message: NOT_FOUND_MESSAGE };
  }
}

async function searchRepertuarim(query: string) {
  const searchUrl = `${REPERTUARIM_URL}/ara/${encodeURIComponent(query)}/`;
  const html = await getHtml(searchUrl, REPERTUARIM_URL);
  const $searchPage = cheerio.load(html);
  const songs: SongSearchListItem[] = [];
  const artists: SongArtistResult[] = [];
  $searchPage("a[href]").each((_, element) => {
    const href = $searchPage(element).attr("href") || "";
    const text = $searchPage(element).text();
    const song = parseRepertuarimSongLink(href, text);
    if (song) songs.push(song);
    const artistResult = parseRepertuarimArtistLink(href, text);
    if (artistResult) artists.push(artistResult);
  });
  return { songs: dedupeSongs(songs), artists: dedupeArtists(artists) };
}

async function searchUltimateGuitar(query: string) {
  const result = await getUltimateGuitarJson<{ tabs?: UltimateGuitarTab[] }>("/tab/search", {
    title: query,
    type: 300,
  });
  return dedupeSongs(
    (result.tabs ?? [])
      .filter((tab) => String(tab.type ?? "").toLowerCase().includes("chord") || Number(tab.type) === 300)
      .map((tab) => ({
        title: tab.song_name,
        artist: tab.artist_name,
        source: `ug:${tab.id}`,
        provider: "ultimate-guitar",
        cover: tab.album_cover?.app_album_cover?.small ?? tab.artist_cover?.app_artist_cover?.small,
      }))
      .filter((song) => song.title && song.artist && song.source),
  ).slice(0, 20);
}

async function searchUakor(query: string) {
  const searchUrls = [`${UAKOR_URL}/arama/${encodeURIComponent(slugify(query))}`, `${UAKOR_URL}/sanatci/${encodeURIComponent(slugify(query))}`];
  const songs: SongSearchListItem[] = [];
  for (const url of searchUrls) {
    try {
      const html = await getHtml(url, UAKOR_URL);
      const linkRegex = /href=\\?"([^"\\]*\/akor\/[^"\\]*)\\?"[^>]*?(?:title=\\?"([^"\\]*)\\?")?[^>]*>([\s\S]*?)<\/a>/g;
      for (const match of html.matchAll(linkRegex)) {
        const song = parseUakorSongLink(match[1], match[3].replace(/<[^>]+>/g, " "), match[2] ?? "");
        if (song) songs.push(song);
      }
    } catch {
      // uAkor search URL may not exist for every query; continue to next fallback.
    }
  }
  return dedupeSongs(songs).slice(0, 40);
}

async function searchAkorlar(query: string) {
  const urls = [`${AKORLAR_URL}/${encodeURIComponent(slugify(query))}`, `${AKORLAR_URL}/arama?kelime=${encodeURIComponent(query)}`];
  const songs: SongSearchListItem[] = [];
  for (const url of urls) {
    try {
      const html = await getHtml(url, AKORLAR_URL);
      const $ = cheerio.load(html);
      $("a[href]").each((_, element) => {
        const href = $(element).attr("href") || "";
        const text = $(element).attr("title") || $(element).text();
        const song = parseAkorlarSongLink(href, text, query);
        if (song) songs.push(song);
      });
    } catch {
      // Akorlar.com can be Cloudflare-protected from server HTTP; skip safely.
    }
  }
  return dedupeSongs(songs).slice(0, 40);
}

function sortByQuery(songs: SongSearchListItem[], query: string) {
  const normalized = normalizeText(query);
  return songs.sort((a, b) => {
    const aText = `${normalizeText(a.artist)} ${normalizeText(a.title)}`;
    const bText = `${normalizeText(b.artist)} ${normalizeText(b.title)}`;
    const aExactArtist = normalizeText(a.artist) === normalized ? 0 : 1;
    const bExactArtist = normalizeText(b.artist) === normalized ? 0 : 1;
    if (aExactArtist !== bExactArtist) return aExactArtist - bExactArtist;
    const aStarts = aText.startsWith(normalized) ? 0 : 1;
    const bStarts = bText.startsWith(normalized) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return 0;
  });
}

function matchesWantedArtist(song: SongSearchListItem, artist: string) {
  if (!artist) return true;
  const wanted = normalizeText(artist);
  const actual = normalizeText(song.artist);
  if (!actual || actual === normalizeText("Bilinmeyen Sanatçı")) return false;
  return actual === wanted || actual.includes(wanted) || wanted.includes(actual);
}

function matchesWantedTitle(song: SongSearchListItem, title: string) {
  if (!title) return true;
  const wanted = normalizeText(title);
  const actual = normalizeText(song.title);
  if (!actual) return false;
  return actual === wanted || actual.includes(wanted) || wanted.includes(actual);
}

function filterByExplicitFields(songs: SongSearchListItem[], title: string, artist: string) {
  const filtered = songs.filter((song) => matchesWantedArtist(song, artist) && matchesWantedTitle(song, title));
  if (filtered.length) return filtered;
  return artist ? [] : songs.filter((song) => matchesWantedTitle(song, title));
}

async function searchSongs(query: string, title = "", artist = ""): Promise<SongSearchResponse> {
  const [repertuarim, ugSongs, uakorSongs, akorlarSongs] = await Promise.all([
    searchRepertuarim(query).catch(() => ({ songs: [], artists: [] as SongArtistResult[] })),
    searchUltimateGuitar(query).catch(() => []),
    searchUakor(query).catch(() => []),
    searchAkorlar(query).catch(() => []),
  ]);

  const allSongs = [...repertuarim.songs, ...ugSongs, ...uakorSongs, ...akorlarSongs];
  const songs = sortByQuery(filterByExplicitFields(allSongs, title, artist), query).slice(0, 80);
  const artists = title
    ? []
    : repertuarim.artists
        .filter((artistResult) => !artist || normalizeText(artistResult.name) === normalizeText(artist))
        .map((artistResult) => ({
          ...artistResult,
          songCount: songs.filter((song) => normalizeText(song.artist) === normalizeText(artistResult.name)).length || undefined,
        }));

  if (!songs.length) return { found: false, message: NOT_FOUND_MESSAGE, songs: [], artists: [] };
  return { found: false, message: "Şarkı seç.", songs, artists: artists.slice(0, 12) };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SearchRequest | null;
  const query = (body?.query || [body?.artist, body?.title].filter(Boolean).join(" ")).trim();
  const artist = body?.artist?.trim() ?? "";
  const source = body?.source?.trim() ?? "";

  if (!query && !source) {
    return NextResponse.json<SongSearchResponse>({ found: false, message: NOT_FOUND_MESSAGE }, { status: 400 });
  }

  try {
    const result = source ? await fetchSongByUrl(source, artist) : await searchSongs(query, body?.title?.trim() ?? "", artist);
    return NextResponse.json<SongSearchResponse>(result);
  } catch (error) {
    console.error("Song search failed", error);
    return NextResponse.json<SongSearchResponse>({ found: false, message: "Şarkı aranırken bir hata oluştu." }, { status: 500 });
  }
}

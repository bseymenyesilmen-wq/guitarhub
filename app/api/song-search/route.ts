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

type Provider = "repertuarim" | "ultimate-guitar" | "uakor";

const NOT_FOUND_MESSAGE = "Şarkı bulunamadı.";
const REPERTUARIM_URL = "https://www.repertuarim.com";
const ULTIMATE_GUITAR_URL = "https://www.ultimate-guitar.com";
const ULTIMATE_TABS_URL = "https://tabs.ultimate-guitar.com";
const UAKOR_URL = "https://uakor.com";
const UAKOR_API_URL = "https://api.uakor.com/api";
const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const ULTIMATE_GUITAR_API_URL = "https://api.ultimate-guitar.com/api/v1";
const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

const TURKISH_ARTIST_MARKERS = [
  "Duman",
  "Mor ve Ötesi",
  "Manga",
  "maNga",
  "Teoman",
  "Şebnem Ferah",
  "Yüksek Sadakat",
  "Pinhani",
  "Athena",
  "Model",
  "Yüzyüzeyken Konuşuruz",
  "Dolu Kadehi Ters Tut",
  "Son Feci Bisiklet",
  "Kaan Tangöze",
  "Pilli Bebek",
  "Halil Sezai",
  "Dedublüman",
  "Sertab Erener",
  "Cem Karaca",
  "Barış Manço",
  "MFÖ",
  "Mavi Gri",
  "Emre Aydın",
  "Can Ozan",
  "Adamlar",
  "Redd",
  "Gripin",
  "Seksendört",
  "Müslüm Gürses",
  "Zeki Müren",
  "Oğuzhan Koç",
  "Oguzhan Koc",
  "Gökhan Türkmen",
  "Ece Seçkin",
  "Aydilge",
  "Melike Şahin",
  "Berkay",
  "Kolpa",
  "Emre Fel",
];

const SIMILAR_ARTISTS: Record<string, string[]> = {
  duman: ["Mor ve Ötesi", "Manga", "Teoman", "Şebnem Ferah", "Yüzyüzeyken Konuşuruz", "Dolu Kadehi Ters Tut", "Son Feci Bisiklet", "Kaan Tangöze", "Pilli Bebek"],
  "mor ve otesi": ["Duman", "Manga", "Teoman", "Şebnem Ferah", "Athena", "Pilli Bebek", "Dolu Kadehi Ters Tut"],
  manga: ["Duman", "Mor ve Ötesi", "Athena", "Şebnem Ferah", "Model", "Pilli Bebek"],
  teoman: ["Duman", "Mor ve Ötesi", "Şebnem Ferah", "Yüksek Sadakat", "Pinhani", "Kaan Tangöze", "Halil Sezai"],
  "pilli bebek": ["Duman", "Kaan Tangöze", "Teoman", "Mor ve Ötesi", "Son Feci Bisiklet", "Yüzyüzeyken Konuşuruz"],
  "son feci bisiklet": ["Yüzyüzeyken Konuşuruz", "Dolu Kadehi Ters Tut", "Pilli Bebek", "Duman", "Can Ozan"],
  "dolu kadehi ters tut": ["Son Feci Bisiklet", "Yüzyüzeyken Konuşuruz", "Dedublüman", "Adamlar", "Can Ozan"],
  "halil sezai": ["Teoman", "Pilli Bebek", "Kaan Tangöze", "Duman", "Dedublüman"],
  radiohead: ["Nirvana", "Arctic Monkeys", "Coldplay", "Muse", "The Smashing Pumpkins"],
  nirvana: ["Radiohead", "Pearl Jam", "Foo Fighters", "Alice In Chains", "Soundgarden"],
  "chris isaak": ["Radiohead", "Nirvana", "Arctic Monkeys", "Coldplay", "The Cranberries"],
  "arctic monkeys": ["Radiohead", "The Strokes", "Muse", "Nirvana", "Coldplay"],
};

const FOREIGN_PLAY_NEXT_QUERIES = [
  "Radiohead Creep",
  "Chris Isaak Wicked Game",
  "Arctic Monkeys Do I Wanna Know",
  "Nirvana Heart Shaped Box",
  "Coldplay Yellow",
  "Eagles Hotel California",
  "Jeff Buckley Hallelujah",
];
const TURKISH_PLAY_NEXT_QUERIES = [
  "Duman Senden Daha Guzel",
  "Duman Hayati Yasa",
  "Duman Tovbe",
  "Mor ve Ötesi Bir Derdim Var",
  "Mor ve Ötesi Cambaz",
  "Manga Cevapsiz Sorular",
  "Teoman Paramparca",
  "Teoman Kupa Kizi Sinek Valesi",
  "Şebnem Ferah Sil Baştan",
  "Yüzyüzeyken Konuşuruz Uykusuz Ve Dengesiz",
  "Dolu Kadehi Ters Tut Belki",
  "Dolu Kadehi Ters Tut Aldattın Mı",
  "Son Feci Bisiklet Bu Kız",
  "Son Feci Bisiklet Bikinisinde Astronomi",
  "Kaan Tangöze Gölge Etme",
  "Kaan Tangöze Bekle Dedi Gitti",
  "Halil Sezai İsyan",
  "Pilli Bebek Bak",
  "Pilli Bebek Olsun",
  "Oguzhan Koc Bulutlara Esir Olduk",
  "Oguzhan Koc Ayy",
];

const ARTIST_DISCOVERY_QUERIES: Record<string, string[]> = {
  duman: ["Duman Hayati Yasa", "Duman Tovbe", "Duman Senden Daha Guzel", "Duman Halimiz Duman", "Duman Aman Aman"],
};

function normalizeEscapedLineBreaks(content: string) {
  return content.replace(/\\t/g, "    ").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\\r/g, "\n");
}

function cleanPreContent(content: string) {
  return normalizeEscapedLineBreaks(content)
    .replace(/\\(?= {4})/g, "")
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

function parseUakorSongLink(href: string, text: string, titleAttr = ""): SongSearchListItem | null {
  if (!href.includes("/akor/")) return null;
  const sourceText = titleAttr || text;
  const cleaned = cleanAnchorText(sourceText).replace(/\s+Akor(?:ları)?$/i, "").trim();
  const parsed = parseSongTitle(cleaned);
  if (!parsed.artist || !parsed.title || parsed.title === parsed.artist) return null;
  return { ...parsed, provider: "uakor", source: absoluteUrl(href, UAKOR_URL) };
}

function titleFromUakorSlug(href: string, artist = "") {
  const slug = href
    .split("/akor/")[1]
    ?.split(/[?#]/)[0]
    ?.replace(/-akor-orijinalton$/i, "")
    ?.replace(/-orijinalton$/i, "")
    ?.replace(/-akor(?:lar)?$/i, "")
    .replace(/-chords$/i, "")
    .replace(/-\d+$/g, "")
    .replace(/-akor(?:lar)?$/i, "")
    .replace(new RegExp(`^${slugify(artist)}-`, "i"), "")
    .replace(/-/g, " ")
    .trim();
  if (!slug) return "";
  return slug.replace(/\b\w/g, (char) => char.toLocaleUpperCase("tr-TR"));
}

function extractUakorPlainAkorLinks(html: string) {
  return Array.from(new Set([...html.matchAll(/\/akor\/[a-z0-9-]+/gi)].map((match) => match[0])));
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

function recommendationIdentity(song: Pick<SongSearchListItem, "artist" | "title">) {
  return `${normalizeText(song.artist)}-${normalizeText(song.title)}`;
}

function dedupeBySongIdentity(songs: SongSearchListItem[]) {
  const seen = new Set<string>();
  return songs.filter((song) => {
    const key = recommendationIdentity(song);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function groupSongVariants(songs: SongSearchListItem[]) {
  const grouped = new Map<string, SongSearchListItem[]>();
  for (const song of songs) {
    const key = recommendationIdentity(song);
    const variants = grouped.get(key) ?? [];
    if (!variants.some((variant) => variant.source === song.source)) variants.push(song);
    grouped.set(key, variants);
  }

  return Array.from(grouped.values()).map((variants) => ({
    ...variants[0],
    variants: variants.length > 1 ? variants : undefined,
  }));
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

type UakorPreload = {
  slug?: string;
  data?: {
    title?: string;
    tone?: string;
    content?: string;
    lyrics?: string;
    artist?: { name?: string };
  };
};

function decodeEscapedJsonField(value = "") {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value.replace(/\\\\r\\\\n/g, "\n").replace(/\\\\n/g, "\n").replace(/\\\\t/g, "    ").replace(/\\\\\"/g, '"');
  }
}

function matchEscapedJsonField(raw: string, key: string) {
  const pattern = new RegExp(`\\\\"${key}\\\\":\\\\"((?:\\\\\\\\.|[^\\\\"\\\\\\\\])*)\\\\"`);
  const match = raw.match(pattern);
  return match ? decodeEscapedJsonField(match[1]) : "";
}

function extractUakorPreload(html: string): UakorPreload | null {
  const match = html.match(/window\.__CHORD_PRELOAD__=({[\s\S]*?});/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as UakorPreload;
  } catch {
    try {
      return JSON.parse(match[1].replace(/\\"/g, '"')) as UakorPreload;
    } catch {
      const raw = match[1];
      const artistMatch = raw.match(/\\"artist\\":\{[\s\S]*?\\"name\\":\\"((?:\\\\.|[^\"\\])*)\\"/);
      const title = matchEscapedJsonField(raw, "title");
      const artistName = artistMatch ? decodeEscapedJsonField(artistMatch[1]) : "";
      if (!title || !artistName) return null;
      return {
        slug: matchEscapedJsonField(raw, "slug"),
        data: {
          title,
          tone: matchEscapedJsonField(raw, "tone"),
          artist: { name: artistName },
        },
      };
    }
  }
}

function extractUakorPreContent(html: string) {
  const preload = extractUakorPreload(html);
  if (preload?.data?.content) return cleanPreContent(normalizeEscapedLineBreaks(preload.data.content));

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

function isUltimateGuitarChordType(type: string | number | undefined) {
  return String(type ?? "").toLowerCase().includes("chord") || Number(type) === 300;
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

type UakorApiArtist = {
  id?: string;
  name?: string;
  slug?: string;
  image?: string;
  chord_count?: number;
};

type UakorApiChord = {
  id?: string;
  title?: string;
  slug?: string;
  tone?: string;
  content?: string;
  url?: string;
  artistName?: string;
  artistSlug?: string;
  artist?: UakorApiArtist;
};

type UakorSearchApiResponse = {
  success?: boolean;
  data?: {
    akords?: UakorApiChord[];
    chords?: UakorApiChord[];
    artists?: UakorApiArtist[];
  };
};

type UakorArtistSearchApiResponse = {
  success?: boolean;
  data?: UakorApiArtist[];
};

type UakorArtistChordsApiResponse = {
  success?: boolean;
  data?: { data?: UakorApiChord[] } | UakorApiChord[];
};

function buildUakorSongItem(chord: UakorApiChord, fallbackArtist = ""): SongSearchListItem | null {
  const title = chord.title?.trim() ?? "";
  const artist = chord.artist?.name?.trim() || chord.artistName?.trim() || fallbackArtist.trim();
  const slug = chord.slug?.trim() ?? "";
  if (!title || !artist || !slug) return null;
  return {
    title,
    artist,
    source: `${UAKOR_URL}/akor/${chord.slug}`,
    provider: "uakor",
    cover: chord.artist?.image ? absoluteUrl(chord.artist.image, UAKOR_URL) : undefined,
  };
}

type ITunesSearchResponse = {
  resultCount?: number;
  results?: Array<{
    artistName?: string;
    trackName?: string;
    artworkUrl100?: string;
  }>;
};

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

function isKnownTurkishArtist(artist: string) {
  const normalized = normalizeText(artist);
  return TURKISH_ARTIST_MARKERS.some((marker) => {
    const markerText = normalizeText(marker);
    return normalized === markerText || normalized.includes(markerText) || markerText.includes(normalized);
  });
}

function isTurkishSongContext(artist: string, title: string) {
  const raw = `${artist} ${title}`;
  if (isKnownTurkishArtist(artist)) return true;
  if (/[çğıöşüİı]/.test(raw)) return true;
  return false;
}

function isLikelyForeignSong(artist: string, title: string) {
  if (isTurkishSongContext(artist, title)) return false;
  const text = normalizeText(`${artist} ${title}`);
  return /^[a-z0-9\s]+$/.test(text) && !/[çğıöşü]/i.test(`${artist} ${title}`);
}

function isTurkishRecommendation(song: Pick<SongSearchListItem, "artist" | "title">) {
  return isTurkishSongContext(song.artist, song.title);
}

function stableNumber(value: string) {
  return [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function svgEscape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fallbackCoverForSong(artist: string, title: string) {
  const palette = [
    ["#ef4444", "#18181b"],
    ["#f97316", "#1e1b4b"],
    ["#a855f7", "#111827"],
    ["#06b6d4", "#18181b"],
    ["#22c55e", "#111827"],
    ["#e11d48", "#312e81"],
  ];
  const [from, to] = palette[stableNumber(`${artist}-${title}`) % palette.length];
  const initials = (artist || title || "GH")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("") || "GH";
  const safeArtist = svgEscape(artist || "GuitarHub");
  const safeTitle = svgEscape(title || "Şarkı");
  const safeInitials = svgEscape(initials);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="256" height="256" rx="36" fill="url(#g)"/><circle cx="205" cy="50" r="44" fill="rgba(255,255,255,.12)"/><circle cx="45" cy="210" r="58" fill="rgba(0,0,0,.18)"/><text x="128" y="126" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="900" fill="white">${safeInitials}</text><text x="128" y="174" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="800" fill="white">${safeTitle.slice(0, 18)}</text><text x="128" y="202" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="rgba(255,255,255,.76)">${safeArtist.slice(0, 24)}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const itunesCoverCache = new Map<string, string>();

function highResolutionItunesArtwork(url = "") {
  return url.replace(/\/100x100bb\.(jpg|png|webp)$/i, "/400x400bb.$1");
}

async function findInternetCoverForSong(artist: string, title: string) {
  const cacheKey = `${normalizeText(artist)}-${normalizeText(title)}`;
  if (itunesCoverCache.has(cacheKey)) return itunesCoverCache.get(cacheKey) ?? "";
  const query = new URLSearchParams({
    term: `${artist} ${title}`.trim(),
    entity: "song",
    limit: "5",
    country: "TR",
  });
  try {
    const response = await axios.get<ITunesSearchResponse>(`${ITUNES_SEARCH_URL}?${query.toString()}`, {
      timeout: 6_000,
      validateStatus: (status) => status >= 200 && status < 400,
    });
    const wantedArtist = normalizeText(artist);
    const wantedTitle = normalizeText(title);
    const result = (response.data.results ?? []).find((item) => {
      const itemArtist = normalizeText(item.artistName ?? "");
      const itemTitle = normalizeText(item.trackName ?? "");
      const artistMatches = !wantedArtist || itemArtist.includes(wantedArtist) || wantedArtist.includes(itemArtist);
      const titleMatches = !wantedTitle || itemTitle.includes(wantedTitle) || wantedTitle.includes(itemTitle);
      return item.artworkUrl100 && artistMatches && titleMatches;
    }) ?? response.data.results?.find((item) => item.artworkUrl100);
    const cover = highResolutionItunesArtwork(result?.artworkUrl100 ?? "");
    itunesCoverCache.set(cacheKey, cover);
    return cover;
  } catch {
    itunesCoverCache.set(cacheKey, "");
    return "";
  }
}

function withFallbackCover<T extends SongSearchListItem>(song: T): T {
  return song.cover ? song : { ...song, cover: fallbackCoverForSong(song.artist, song.title) };
}

function withFallbackCovers<T extends SongSearchListItem>(songs: T[]): T[] {
  return songs.map((song) => withFallbackCover(song));
}

async function withInternetOrFallbackCover<T extends SongSearchListItem>(song: T): Promise<T> {
  if (song.cover) return song;
  const internetCover = await findInternetCoverForSong(song.artist, song.title);
  return { ...song, cover: internetCover || fallbackCoverForSong(song.artist, song.title) };
}

async function withInternetOrFallbackCovers<T extends SongSearchListItem>(songs: T[]): Promise<T[]> {
  return Promise.all(songs.map((song) => withInternetOrFallbackCover(song)));
}

function rotateRecommendationSeeds(seeds: string[], key: string) {
  if (!seeds.length) return seeds;
  const bucket = Math.floor(Date.now() / (1000 * 60 * 15));
  const offset = (stableNumber(key) + bucket) % seeds.length;
  return [...seeds.slice(offset), ...seeds.slice(0, offset)];
}

function isUnknownArtistName(artist: string) {
  return normalizeText(artist) === normalizeText("Bilinmeyen Sanatçı");
}

function sortRecommendationCandidates(candidates: SongSearchListItem[], seed: string) {
  const normalizedSeed = normalizeText(seed);
  return candidates.sort((a, b) => {
    const aArtist = normalizeText(a.artist);
    const bArtist = normalizeText(b.artist);
    const aExactArtist = aArtist === normalizedSeed ? 0 : 1;
    const bExactArtist = bArtist === normalizedSeed ? 0 : 1;
    if (aExactArtist !== bExactArtist) return aExactArtist - bExactArtist;
    const aArtistInSeed = normalizedSeed.includes(aArtist) || aArtist.includes(normalizedSeed) ? 0 : 1;
    const bArtistInSeed = normalizedSeed.includes(bArtist) || bArtist.includes(normalizedSeed) ? 0 : 1;
    if (aArtistInSeed !== bArtistInSeed) return aArtistInSeed - bArtistInSeed;
    return 0;
  });
}

async function searchProviderRecommendationCandidates(query: string) {
  const [uakor, repertuarim, ultimate] = await Promise.all([
    searchUakor(query).catch(() => []),
    searchRepertuarim(query).then((result) => result.songs).catch(() => []),
    searchUltimateGuitar(query).catch(() => []),
  ]);
  return sortRecommendationCandidates(dedupeBySongIdentity([...uakor, ...repertuarim, ...ultimate]), query).filter((candidate) => !isUnknownArtistName(candidate.artist));
}

async function buildSystemWideRecommendations(artist: string, title: string, existing: SongSearchListItem[] = []) {
  const isForeign = isLikelyForeignSong(artist, title);
  const recommendations: SongSearchListItem[] = isForeign ? existing.filter((candidate) => !isTurkishRecommendation(candidate)) : [];
  const artistKey = normalizeText(artist);
  const querySeeds = rotateRecommendationSeeds([
    artist ? `${artist}` : "",
    ...(SIMILAR_ARTISTS[artistKey] ?? []).map((similarArtist) => `${similarArtist}`),
    ...(isForeign ? FOREIGN_PLAY_NEXT_QUERIES : TURKISH_PLAY_NEXT_QUERIES),
  ].filter(Boolean), `${artist}-${title}`);

  for (const seed of querySeeds) {
    if (recommendations.length >= 6) break;
    const candidates = await searchProviderRecommendationCandidates(seed);
    for (const candidate of candidates) {
      if (recommendations.length >= 6) break;
      if (normalizeText(candidate.title) === normalizeText(title)) continue;
      if (!isForeign && !isTurkishRecommendation(candidate)) continue;
      if (isForeign && isTurkishRecommendation(candidate)) continue;
      recommendations.push(candidate);
    }
  }

  return await withInternetOrFallbackCovers(dedupeBySongIdentity(recommendations).filter((song) => normalizeText(song.title) !== normalizeText(title)).slice(0, 6));
}

async function getUakorJson<T>(url: string) {
  const response = await axios.get<T>(url, {
    headers: {
      ...REQUEST_HEADERS,
      Accept: "application/json",
      Origin: UAKOR_URL,
      Referer: `${UAKOR_URL}/`,
    },
    timeout: 12_000,
    validateStatus: (status) => status >= 200 && status < 400,
  });
  return response.data;
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
  const preload = extractUakorPreload(html);
  const heading = preload?.data?.artist?.name && preload.data.title ? `${preload.data.artist.name} - ${preload.data.title}` : $("title").text().replace(" | uAkor", "").trim();
  const content = extractUakorPreContent(html);
  if (!content) return { found: false, message: NOT_FOUND_MESSAGE };
  const parsed = parseSongTitle(heading, fallbackArtist);
  const artist = preload?.data?.artist?.name || parsed.artist || fallbackArtist;
  return {
    found: true,
    song: {
      title: parsed.title,
      artist,
      key: preload?.data?.tone ?? "",
      capo: "0",
      chords: content,
      lyrics: content,
      source: songUrl,
      provider: "uAkor",
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
  if (!isUltimateGuitarChordType(tab.type)) return { found: false, message: NOT_FOUND_MESSAGE };
  const content = stripUltimateGuitarMarkup(tab.content ?? "");
  if (!content) return { found: false, message: NOT_FOUND_MESSAGE };
  const existingRecommendations = buildUltimateGuitarRecommendations(tab);

  return {
    found: true,
    song: {
      title: tab.song_name || "Şarkı",
      artist: tab.artist_name || fallbackArtist || "Bilinmeyen Sanatçı",
      key: tab.tonality_name ?? "",
      capo: tab.capo ? String(tab.capo) : "0",
      chords: content,
      lyrics: content,
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
    if (provider === "ultimate-guitar") return await fetchUltimateGuitarSongByUrl(songUrl, fallbackArtist);
    return await fetchRepertuarimSongByUrl(songUrl, fallbackArtist);
  } catch (error) {
    console.error("Song provider fetch failed", { provider: providerForUrl(songUrl), songUrl, error });
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

function uakorSearchQueryVariants(query: string) {
  const variants = new Set([query]);
  const turkishInitialI = query.replace(/\bi/g, "İ");
  variants.add(turkishInitialI);
  return [...variants].filter(Boolean);
}

async function searchUakorApi(query: string) {
  const results = await Promise.all(
    uakorSearchQueryVariants(query).map(async (searchQuery) => {
      const queryParams = new URLSearchParams({ q: searchQuery, limit: "60", offset: "0" });
      const result = await getUakorJson<UakorSearchApiResponse>(`${UAKOR_API_URL}/search?${queryParams.toString()}`);
      const chords = [...(result.data?.akords ?? []), ...(result.data?.chords ?? [])];
      return chords.map((chord) => buildUakorSongItem(chord)).filter((song): song is SongSearchListItem => Boolean(song));
    }),
  );
  return dedupeSongs(results.flat()).slice(0, 80);
}

async function searchUakorArtistCatalogApi(query: string) {
  const queryParams = new URLSearchParams({ q: query, limit: "10" });
  const artistSearch = await getUakorJson<UakorArtistSearchApiResponse>(`${UAKOR_API_URL}/artists/search?${queryParams.toString()}`);
  const wanted = normalizeText(query);
  const artists = (artistSearch.data ?? [])
    .filter((artist) => artist.slug && artist.name)
    .filter((artist) => {
      const name = normalizeText(artist.name ?? "");
      return name === wanted || name.includes(wanted) || wanted.includes(name);
    })
    .slice(0, 3);

  const results = await Promise.all(
    artists.map(async (artist) => {
      const catalog = await getUakorJson<UakorArtistChordsApiResponse>(`${UAKOR_API_URL}/artists/${encodeURIComponent(artist.slug ?? "")}/chords`);
      const chords = Array.isArray(catalog.data) ? catalog.data : (catalog.data?.data ?? []);
      return chords.map((chord) => buildUakorSongItem(chord, artist.name ?? "")).filter((song): song is SongSearchListItem => Boolean(song));
    }),
  );
  return dedupeSongs(results.flat()).slice(0, 180);
}

async function searchUakor(query: string) {
  const searchUrls = [
    `${UAKOR_URL}/arama?q=${encodeURIComponent(query)}`,
    `${UAKOR_URL}/akor/${slugify(query)}`,
    `${UAKOR_URL}/akor/${slugify(query)}-akor`,
    `${UAKOR_URL}/sanatci/${encodeURIComponent(slugify(query))}`,
  ];
  const songs: SongSearchListItem[] = [];
  const [apiSongs, artistCatalogSongs] = await Promise.all([
    searchUakorApi(query).catch(() => []),
    searchUakorArtistCatalogApi(query).catch(() => []),
  ]);
  songs.push(...apiSongs, ...artistCatalogSongs);
  for (const url of searchUrls) {
    try {
      const html = await getHtml(url, UAKOR_URL);
      const isArtistCatalogPage = url.includes("/sanatci/");
      const preload = extractUakorPreload(html);
      if (preload?.data?.title && preload.data.artist?.name) {
        songs.push({
          title: preload.data.title,
          artist: preload.data.artist.name,
          source: preload.slug ? `${UAKOR_URL}/akor/${preload.slug}` : url,
          provider: "uakor",
        });
      }
      const linkRegex = /href=\\?"([^"\\]*\/akor\/[^"\\]*)\\?"[^>]*?(?:title=\\?"([^"\\]*)\\?")?[^>]*>([\s\S]*?)<\/a>/g;
      for (const match of html.matchAll(linkRegex)) {
        const song = parseUakorSongLink(match[1], match[3].replace(/<[^>]+>/g, " "), match[2] ?? "");
        if (song) songs.push(song);
      }
      if (isArtistCatalogPage) {
        for (const href of extractUakorPlainAkorLinks(html)) {
          const title = titleFromUakorSlug(href, query);
          if (!title || normalizeText(title) === normalizeText(query)) continue;
          const parsed = parseSongTitle(`${query} - ${title}`, query);
          songs.push({
            title: parsed.title,
            artist: isArtistCatalogPage ? query : parsed.artist,
            source: `${UAKOR_URL}${href}`,
            provider: "uakor",
          });
        }
      }
    } catch {
      // uAkor search URL may not exist for every query; continue to next fallback.
    }
  }
  return dedupeSongs(songs).slice(0, 180);
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
  const artistKey = normalizeText(artist || query);
  const discoveryQueries = !title && artist ? (ARTIST_DISCOVERY_QUERIES[artistKey] ?? []) : [];
  const [repertuarim, ugSongs, uakorSongs, discoveredSongs] = await Promise.all([
    searchRepertuarim(query).catch(() => ({ songs: [], artists: [] as SongArtistResult[] })),
    searchUltimateGuitar(query).catch(() => []),
    searchUakor(query).catch(() => []),
    Promise.all(discoveryQueries.map((seed) => searchUltimateGuitar(seed).catch(() => []))).then((results) => results.flat()),
  ]);

  const allSongs = [...repertuarim.songs, ...ugSongs, ...discoveredSongs, ...uakorSongs];
  const groupedSongs = groupSongVariants(sortByQuery(filterByExplicitFields(allSongs, title, artist), query)).slice(0, 180);
  const songs = [
    ...(await withInternetOrFallbackCovers(groupedSongs.slice(0, 40))),
    ...withFallbackCovers(groupedSongs.slice(40)),
  ];
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

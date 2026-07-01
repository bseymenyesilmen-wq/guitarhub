import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { type SongArtistResult, type SongSearchListItem, type SongSearchResponse } from "@/lib/songSearch";

type SearchRequest = {
  title?: string;
  artist?: string;
  source?: string;
};

const NOT_FOUND_MESSAGE = "Şarkı bulunamadı.";
const BASE_URL = "https://www.repertuarim.com";
const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
  Referer: BASE_URL,
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

function cleanPreContent(content: string) {
  return content
    .replace(/\t/g, "    ")
    .replace(/\u00a0/g, " ")
    .replace(/\r\n/g, "\n")
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

function absoluteUrl(href: string) {
  return href.startsWith("http") ? href : `${BASE_URL}${href}`;
}

function parseSongLink(href: string, text: string): SongSearchListItem | null {
  if (!href.includes("/akor/")) return null;

  const cleaned = cleanAnchorText(text);
  const [artistPart, ...titleParts] = cleaned.split(" - ");
  const title = titleParts.join(" - ").trim();
  const artist = artistPart?.trim();

  if (!artist || !title) return null;

  return {
    title,
    artist,
    source: absoluteUrl(href),
  };
}

function parseArtistLink(href: string, text: string): SongArtistResult | null {
  if (!href.includes("/akor-tab/")) return null;
  const name = cleanAnchorText(text).replace(/^S(?=[A-ZÇĞİÖŞÜ])/u, "").trim();
  if (!name) return null;
  return { name, source: absoluteUrl(href) };
}

function dedupeSongs(songs: SongSearchListItem[]) {
  const seen = new Set<string>();
  return songs.filter((song) => {
    const key = song.source || `${song.artist}-${song.title}`;
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
  if (fallbackArtist) {
    return fallbackArtist;
  }

  const [possibleArtist] = scrapedTitle.split(" - ");
  return possibleArtist?.trim() || "Bilinmeyen Sanatçı";
}

async function fetchSongByUrl(songUrl: string, fallbackArtist = ""): Promise<SongSearchResponse> {
  if (!songUrl.startsWith(BASE_URL) || !songUrl.includes("/akor/")) {
    return { found: false, message: NOT_FOUND_MESSAGE };
  }

  const songResponse = await axios.get<string>(songUrl, {
    headers: REQUEST_HEADERS,
    timeout: 10_000,
  });

  const $songPage = cheerio.load(songResponse.data);
  const scrapedTitle = $songPage("h1").text().trim() || "Şarkı";
  const defaultKey = $songPage("div#default-key").attr("data-key") || "";
  const rawPreContent =
    $songPage("pre#key.chords").text() ||
    $songPage("pre.chords").text() ||
    $songPage("pre").first().text();

  const fullPreContent = cleanPreContent(rawPreContent);

  if (!fullPreContent) {
    return { found: false, message: "Şarkı içeriği boş veya okunamadı." };
  }

  return {
    found: true,
    song: {
      title: scrapedTitle,
      artist: extractArtistFromTitle(scrapedTitle, fallbackArtist),
      key: defaultKey,
      capo: "0",
      chords: fullPreContent,
      lyrics: fullPreContent,
      source: songUrl,
    },
  };
}

async function searchSongs(title: string, artist: string): Promise<SongSearchResponse> {
  const artistOnly = Boolean(artist && !title);
  const searchQuery = artistOnly ? artist : artist ? `${artist} ${title}` : title;
  const searchUrl = `${BASE_URL}/ara/${encodeURIComponent(searchQuery)}/`;

  const searchResponse = await axios.get<string>(searchUrl, {
    headers: REQUEST_HEADERS,
    timeout: 10_000,
  });

  const $searchPage = cheerio.load(searchResponse.data);
  const songs: SongSearchListItem[] = [];
  const artists: SongArtistResult[] = [];

  $searchPage("a[href]").each((_, element) => {
    const href = $searchPage(element).attr("href") || "";
    const text = $searchPage(element).text();
    const song = parseSongLink(href, text);
    if (song) songs.push(song);
    const artistResult = parseArtistLink(href, text);
    if (artistResult) artists.push(artistResult);
  });

  const normalizedArtist = normalizeText(artist);
  const uniqueSongs = dedupeSongs(songs).sort((a, b) => {
    if (!normalizedArtist) return 0;
    const aExact = normalizeText(a.artist) === normalizedArtist ? 0 : 1;
    const bExact = normalizeText(b.artist) === normalizedArtist ? 0 : 1;
    return aExact - bExact;
  });

  const filteredSongs = artistOnly && normalizedArtist
    ? uniqueSongs.filter((song) => normalizeText(song.artist) === normalizedArtist)
    : uniqueSongs;

  if (!filteredSongs.length) {
    return { found: false, message: NOT_FOUND_MESSAGE, songs: [], artists: dedupeArtists(artists) };
  }

  if (!artistOnly && filteredSongs.length === 1) {
    return fetchSongByUrl(filteredSongs[0].source, filteredSongs[0].artist);
  }

  const uniqueArtists = dedupeArtists(artists).map((artistResult) => ({
    ...artistResult,
    songCount: filteredSongs.filter((song) => normalizeText(song.artist) === normalizeText(artistResult.name)).length || undefined,
  }));

  return {
    found: false,
    message: artistOnly ? "Sanatçının şarkıları listelenir." : "Şarkı seç.",
    songs: filteredSongs.slice(0, 80),
    artists: uniqueArtists.slice(0, 12),
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SearchRequest | null;
  const title = body?.title?.trim() ?? "";
  const artist = body?.artist?.trim() ?? "";
  const source = body?.source?.trim() ?? "";

  if (!title && !artist && !source) {
    return NextResponse.json<SongSearchResponse>(
      { found: false, message: NOT_FOUND_MESSAGE },
      { status: 400 },
    );
  }

  try {
    const result = source ? await fetchSongByUrl(source, artist) : await searchSongs(title, artist);
    return NextResponse.json<SongSearchResponse>(result);
  } catch (error) {
    console.error("Song search failed", error);
    return NextResponse.json<SongSearchResponse>(
      { found: false, message: "Şarkı aranırken bir hata oluştu." },
      { status: 500 },
    );
  }
}

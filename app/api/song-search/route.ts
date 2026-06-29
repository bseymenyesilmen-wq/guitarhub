import axios from "axios";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import { type SongSearchResponse } from "@/lib/songSearch";

type SearchRequest = {
  title?: string;
  artist?: string;
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

function extractArtistFromTitle(scrapedTitle: string, fallbackArtist: string) {
  if (fallbackArtist) {
    return fallbackArtist;
  }

  const [possibleArtist] = scrapedTitle.split(" - ");
  return possibleArtist?.trim() || "Bilinmeyen Sanatçı";
}

async function searchSong(title: string, artist: string): Promise<SongSearchResponse> {
  const searchQuery = artist ? `${artist} ${title}` : title;
  const searchUrl = `${BASE_URL}/ara/${encodeURIComponent(searchQuery)}/`;

  const searchResponse = await axios.get<string>(searchUrl, {
    headers: REQUEST_HEADERS,
    timeout: 10_000,
  });

  const $searchPage = cheerio.load(searchResponse.data);
  const firstSongLink = $searchPage('a[href*="/akor/"]').first().attr("href");

  if (!firstSongLink) {
    return { found: false, message: NOT_FOUND_MESSAGE };
  }

  const songUrl = firstSongLink.startsWith("http")
    ? firstSongLink
    : `${BASE_URL}${firstSongLink}`;

  const songResponse = await axios.get<string>(songUrl, {
    headers: REQUEST_HEADERS,
    timeout: 10_000,
  });

  const $songPage = cheerio.load(songResponse.data);
  const scrapedTitle = $songPage("h1").text().trim() || title;
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
      artist: extractArtistFromTitle(scrapedTitle, artist),
      key: defaultKey,
      capo: "0",
      chords: fullPreContent,
      lyrics: fullPreContent,
      source: songUrl,
    },
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SearchRequest | null;
  const title = body?.title?.trim() ?? "";
  const artist = body?.artist?.trim() ?? "";

  if (!title) {
    return NextResponse.json<SongSearchResponse>(
      { found: false, message: NOT_FOUND_MESSAGE },
      { status: 400 },
    );
  }

  try {
    const result = await searchSong(title, artist);
    return NextResponse.json<SongSearchResponse>(result);
  } catch (error) {
    console.error("Song search failed", error);
    return NextResponse.json<SongSearchResponse>(
      { found: false, message: "Şarkı aranırken bir hata oluştu." },
      { status: 500 },
    );
  }
}

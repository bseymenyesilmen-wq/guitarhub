export type SongSearchResult = {
  title: string;
  artist: string;
  key: string;
  capo: string;
  chords: string;
  lyrics: string;
  tab?: string;
  source?: string;
  provider?: string;
  recommendations?: SongSearchListItem[];
};

export type SongSearchListItem = {
  title: string;
  artist: string;
  source: string;
  provider?: string;
  cover?: string;
};

export type SongArtistResult = {
  name: string;
  source?: string;
  songCount?: number;
};

export type SongSearchResponse =
  | {
      found: true;
      song: SongSearchResult;
    }
  | {
      found: false;
      message: string;
      songs?: SongSearchListItem[];
      artists?: SongArtistResult[];
    };

export function normalizeSongSearchResult(value: unknown): SongSearchResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const artist = typeof record.artist === "string" ? record.artist.trim() : "";
  const chords = typeof record.chords === "string" ? record.chords.trim() : "";
  const lyrics = typeof record.lyrics === "string" ? record.lyrics.trim() : "";
  const tab = typeof record.tab === "string" ? record.tab.trim() : "";

  if (!title || !artist || (!chords && !lyrics && !tab)) {
    return null;
  }

  return {
    title,
    artist,
    chords,
    lyrics,
    tab,
    key: typeof record.key === "string" ? record.key.trim() : "",
    capo: typeof record.capo === "string" ? record.capo.trim() : "",
    source: typeof record.source === "string" ? record.source.trim() : undefined,
    provider: typeof record.provider === "string" ? record.provider.trim() : undefined,
    recommendations: Array.isArray(record.recommendations) ? (record.recommendations as SongSearchListItem[]) : undefined,
  };
}

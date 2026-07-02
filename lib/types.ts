export type Song = {
  id: number;
  user_id: string;
  title: string;
  artist: string;
  key?: string | null;
  bpm?: number | null;
  lyrics?: string | null;
  chords?: string | null;
  difficulty?: string | null;
  capo?: string | null;
  notes?: string | null;
  favorite?: boolean | null;
  created_at?: string | null;
};

export type Setlist = {
  id: number;
  user_id: string;
  name: string;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  setlist_songs?: SetlistSong[];
};

export type SetlistSong = {
  id: number;
  setlist_id: number;
  song_id: number;
  position: number;
  created_at?: string | null;
  songs?: Song | null;
};

export type SongForm = Record<string, string | boolean> & {
  title: string;
  artist: string;
  key: string;
  bpm: string;
  lyrics: string;
  chords: string;
  difficulty: string;
  capo: string;
  notes: string;
  favorite: boolean;
};

export type PracticeLog = {
  id: number;
  user_id: string;
  minutes: number;
  goal_minutes: number;
  note?: string | null;
  practiced_at: string;
  created_at?: string | null;
};

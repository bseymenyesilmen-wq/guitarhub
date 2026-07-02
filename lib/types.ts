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

export type LearningTab = {
  id: number;
  slug: string;
  title: string;
  artist: string;
  artist_slug: string;
  status: "draft" | "private" | "published";
  source_type: "user" | "import" | "ai" | "licensed" | "demo";
  tuning?: string | null;
  capo?: string | null;
  bpm?: number | null;
  key?: string | null;
  instruments: string[];
  tab_text: string;
  contributor_id?: string | null;
  contributor_name?: string | null;
  revision_number: number;
  created_at?: string | null;
  updated_at?: string | null;
  learning_tab_tracks?: LearningTabTrack[];
};

export type LearningTabTrack = {
  id: number;
  tab_id: number;
  name: string;
  instrument: string;
  tuning?: string | null;
  volume: number;
  muted: boolean;
  solo: boolean;
  tab_text: string;
  midi_data?: Record<string, unknown> | null;
  position: number;
  created_at?: string | null;
};

export type LearningPlaylist = {
  id: number;
  user_id: string;
  name: string;
  description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

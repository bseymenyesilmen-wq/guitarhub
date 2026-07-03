-- Removes the cancelled Song Learning / Şarkı Öğren data model.
-- Safe to run multiple times.

delete from storage.objects where bucket_id = 'learning-tabs';
delete from storage.buckets where id = 'learning-tabs';

drop table if exists public.learning_playlist_items cascade;
drop table if exists public.learning_playlists cascade;
drop table if exists public.learning_history cascade;
drop table if exists public.learning_favorites cascade;
drop table if exists public.learning_tab_revisions cascade;
drop table if exists public.learning_tab_tracks cascade;
drop table if exists public.learning_tabs cascade;

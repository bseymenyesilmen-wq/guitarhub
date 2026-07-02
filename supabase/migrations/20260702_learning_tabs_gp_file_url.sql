alter table public.learning_tabs
  add column if not exists gp_file_url text;

comment on column public.learning_tabs.gp_file_url is 'Optional public/allowed Guitar Pro file URL for AlphaTab rendering and playback.';

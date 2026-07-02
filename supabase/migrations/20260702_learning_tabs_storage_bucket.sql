insert into storage.buckets (id, name, public, file_size_limit)
values ('learning-tabs', 'learning-tabs', true, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "Public can read learning tab files" on storage.objects;
create policy "Public can read learning tab files"
  on storage.objects for select
  using (bucket_id = 'learning-tabs');

drop policy if exists "Users can upload own learning tab files" on storage.objects;
create policy "Users can upload own learning tab files"
  on storage.objects for insert
  with check (
    bucket_id = 'learning-tabs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own learning tab files" on storage.objects;
create policy "Users can update own learning tab files"
  on storage.objects for update
  using (
    bucket_id = 'learning-tabs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'learning-tabs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own learning tab files" on storage.objects;
create policy "Users can delete own learning tab files"
  on storage.objects for delete
  using (
    bucket_id = 'learning-tabs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

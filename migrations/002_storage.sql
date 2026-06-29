-- =====================================================
-- Storage Bucket: used-phone-photos
-- 公开读(供公共 /shop 页面匿名展示)
-- 商家按 owner 路径写
-- =====================================================

-- 1. 创建 bucket(若不存在)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'used-phone-photos',
  'used-phone-photos',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. RLS 策略
-- 公共读
drop policy if exists "phone photos public read" on storage.objects;
create policy "phone photos public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'used-phone-photos');

-- 商家写(只能写到自己的 owner_id 文件夹)
drop policy if exists "phone photos owner write" on storage.objects;
create policy "phone photos owner write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'used-phone-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 商家改/删自己文件夹下的文件
drop policy if exists "phone photos owner update" on storage.objects;
create policy "phone photos owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'used-phone-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "phone photos owner delete" on storage.objects;
create policy "phone photos owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'used-phone-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

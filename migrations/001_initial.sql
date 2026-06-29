-- =====================================================
-- 优品二手手机店 - 数据库结构
-- 独立 Supabase 项目,所有表 RLS 严格隔离
-- =====================================================

-- 1. 二手手机主表
create table if not exists public.used_phones (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  -- 基本信息
  brand text not null,
  model text not null,
  storage text default '',
  color text default '',
  -- 状况描述
  condition text default '95新',          -- 成色:99新/95新/9新/8新等
  battery_health int default 90,          -- 电池健康度 %
  -- 内部信息(不对外公开)
  imei text default '',
  source text default '',                  -- 回收来源
  source_price numeric(10,2) default 0,   -- 回收价
  -- 公开信息
  title text default '',
  description text default '',
  faults text default '',                  -- 瑕疵说明
  accessories text default '',             -- 配件
  sell_price numeric(10,2) default 0,     -- 售价
  status text not null default 'available', -- available/reserved/sold/offline
  listed_at timestamptz not null default now(),
  sold_at timestamptz,
  sold_price numeric(10,2),
  buyer_phone text default '',
  -- 备注
  remark text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_used_phones_owner on public.used_phones(owner_id);
create index if not exists idx_used_phones_status on public.used_phones(status);
create index if not exists idx_used_phones_listed on public.used_phones(listed_at desc);

-- updated_at 自动维护
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_used_phones_updated on public.used_phones;
create trigger trg_used_phones_updated
  before update on public.used_phones
  for each row execute function public.set_updated_at();

-- 2. 手机相册表
create table if not exists public.used_phone_photos (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid not null references public.used_phones(id) on delete cascade,
  url text not null,
  storage_path text not null,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_photos_phone on public.used_phone_photos(phone_id);

-- 3. 客户询价表(公共可写)
create table if not exists public.used_phone_inquiries (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid references public.used_phones(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  message text default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_inquiries_phone on public.used_phone_inquiries(phone_id);
create index if not exists idx_inquiries_created on public.used_phone_inquiries(created_at desc);

-- =====================================================
-- RLS
-- =====================================================
alter table public.used_phones enable row level security;
alter table public.used_phone_photos enable row level security;
alter table public.used_phone_inquiries enable row level security;

-- used_phones: 商家看自己全部 / 公共只看待售
drop policy if exists "phones owner all" on public.used_phones;
create policy "phones owner all" on public.used_phones
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "phones public read available" on public.used_phones;
create policy "phones public read available" on public.used_phones
  for select to anon, authenticated
  using (status = 'available');

-- photos: 商家全部 / 公共按 phone 关联
drop policy if exists "photos owner all" on public.used_phone_photos;
create policy "photos owner all" on public.used_phone_photos
  for all to authenticated
  using (
    phone_id in (select id from public.used_phones where owner_id = auth.uid())
  )
  with check (
    phone_id in (select id from public.used_phones where owner_id = auth.uid())
  );

drop policy if exists "photos public read" on public.used_phone_photos;
create policy "photos public read" on public.used_phone_photos
  for select to anon, authenticated
  using (
    phone_id in (select id from public.used_phones where status = 'available')
  );

-- inquiries: 商家可读 / 公共可插入
drop policy if exists "inquiries public insert" on public.used_phone_inquiries;
create policy "inquiries public insert" on public.used_phone_inquiries
  for insert to anon, authenticated
  with check (true);

drop policy if exists "inquiries owner read" on public.used_phone_inquiries;
create policy "inquiries owner read" on public.used_phone_inquiries
  for select to authenticated
  using (
    phone_id in (select id from public.used_phones where owner_id = auth.uid())
  );

-- =====================================================
-- 实时推送(可选)
-- =====================================================
alter publication supabase_realtime add table public.used_phones;
alter publication supabase_realtime add table public.used_phone_inquiries;

-- profiles
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  display_name  text not null,
  bio           text,
  avatar_url    text,
  title         text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- posts
create table public.posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade not null,
  title         text not null,
  body          text not null,
  place_name    text not null,
  address       text,
  lat           float8,
  lng           float8,
  category      text not null check (category in ('飲食','宿泊','体験','スポット','その他')),
  thumbnail_url text,
  for_whom      text not null,
  scene         text not null,
  reason        text not null,
  caution       text,
  visibility    text not null default 'public' check (visibility in ('public','limited','private')),
  save_count    int not null default 0,
  view_count    int not null default 0,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- saves
create table public.saves (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles(id) on delete cascade not null,
  post_id    uuid references public.posts(id) on delete cascade not null,
  memo       text,
  status     text check (status in ('行きたい','接待向き','家族向け','デート向き','自分に合いそう','保留','再訪したい')),
  tags       text[] default '{}',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, post_id)
);

-- lists
create table public.lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  title       text not null,
  description text,
  visibility  text not null default 'public' check (visibility in ('public','limited','private')),
  created_at  timestamptz default now() not null
);

-- list_posts
create table public.list_posts (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid references public.lists(id) on delete cascade not null,
  post_id    uuid references public.posts(id) on delete cascade not null,
  sort_order int not null default 0,
  created_at timestamptz default now() not null,
  unique(list_id, post_id)
);

-- updated_at 自動更新
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger posts_updated_at before update on public.posts
  for each row execute procedure public.handle_updated_at();

create trigger saves_updated_at before update on public.saves
  for each row execute procedure public.handle_updated_at();

-- 新規ユーザー登録時にプロフィールを自動生成
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS有効化
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.saves enable row level security;
alter table public.lists enable row level security;
alter table public.list_posts enable row level security;

-- profiles RLS
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- posts RLS
create policy "posts_select_public" on public.posts for select
  using (visibility = 'public' or auth.uid() = user_id);
create policy "posts_insert" on public.posts for insert
  with check (auth.uid() = user_id);
create policy "posts_update" on public.posts for update
  using (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete
  using (auth.uid() = user_id);

-- saves RLS
create policy "saves_select" on public.saves for select using (auth.uid() = user_id);
create policy "saves_insert" on public.saves for insert with check (auth.uid() = user_id);
create policy "saves_update" on public.saves for update using (auth.uid() = user_id);
create policy "saves_delete" on public.saves for delete using (auth.uid() = user_id);

-- lists RLS
create policy "lists_select" on public.lists for select
  using (visibility = 'public' or auth.uid() = user_id);
create policy "lists_insert" on public.lists for insert with check (auth.uid() = user_id);
create policy "lists_update" on public.lists for update using (auth.uid() = user_id);
create policy "lists_delete" on public.lists for delete using (auth.uid() = user_id);

-- list_posts RLS
create policy "list_posts_select" on public.list_posts for select
  using (exists (
    select 1 from public.lists l
    where l.id = list_id and (l.visibility = 'public' or l.user_id = auth.uid())
  ));
create policy "list_posts_insert" on public.list_posts for insert
  with check (exists (
    select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()
  ));
create policy "list_posts_delete" on public.list_posts for delete
  using (exists (
    select 1 from public.lists l where l.id = list_id and l.user_id = auth.uid()
  ));

-- Storage bucket (画像アップロード用)
insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true);

create policy "thumbnails_select" on storage.objects for select
  using (bucket_id = 'thumbnails');
create policy "thumbnails_insert" on storage.objects for insert
  with check (bucket_id = 'thumbnails' and auth.uid() is not null);
create policy "thumbnails_delete" on storage.objects for delete
  using (bucket_id = 'thumbnails' and auth.uid() = owner);

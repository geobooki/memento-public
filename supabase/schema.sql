create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null, entry_time time not null, text text not null, category text not null default 'other', done boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists entries_user_date_idx on public.entries(user_id, entry_date, entry_time);
alter table public.entries enable row level security;
drop policy if exists "Users can read their own entries" on public.entries;
create policy "Users can read their own entries" on public.entries for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own entries" on public.entries;
create policy "Users can create their own entries" on public.entries for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own entries" on public.entries;
create policy "Users can update their own entries" on public.entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own entries" on public.entries;
create policy "Users can delete their own entries" on public.entries for delete using (auth.uid() = user_id);

create table if not exists public.entry_revisions (
  id uuid primary key default gen_random_uuid(), entry_id uuid not null references public.entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  previous_text text not null, next_text text not null, changed_at timestamptz not null default now()
);
create index if not exists entry_revisions_entry_idx on public.entry_revisions(entry_id, changed_at desc);
alter table public.entry_revisions enable row level security;
drop policy if exists "Users can read their own entry revisions" on public.entry_revisions;
create policy "Users can read their own entry revisions" on public.entry_revisions for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own entry revisions" on public.entry_revisions;
create policy "Users can create their own entry revisions" on public.entry_revisions for insert with check (auth.uid() = user_id);

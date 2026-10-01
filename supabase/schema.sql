create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null, entry_time time not null, text text not null, category text not null default 'other', done boolean not null default false, created_at timestamptz not null default now()
);
alter table public.entries add column if not exists priority text not null default 'normal';
alter table public.entries add column if not exists due_date date;
alter table public.entries add column if not exists due_time time;
alter table public.entries add column if not exists reminder_at timestamptz;
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

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, ingredient text, dose_amount text not null default '1', dose_unit text not null default '정',
  schedule text not null default '필요시', instructions text, active boolean not null default true,
  document_path text, created_at timestamptz not null default now()
);
create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade, taken_at timestamptz not null default now(),
  amount text not null, unit text not null, timing text not null default '기타', note text
);
create table if not exists public.medication_changes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade, changed_at timestamptz not null default now(),
  previous_name text not null, previous_dose_amount text not null, previous_dose_unit text not null,
  previous_schedule text not null, next_name text not null, next_dose_amount text not null, next_dose_unit text not null, next_schedule text not null
);
create index if not exists medication_logs_user_time_idx on public.medication_logs(user_id, taken_at desc);
alter table public.medications enable row level security;
alter table public.medication_logs enable row level security;
alter table public.medication_changes enable row level security;
drop policy if exists "Users can read their own medications" on public.medications;
create policy "Users can read their own medications" on public.medications for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own medications" on public.medications;
create policy "Users can create their own medications" on public.medications for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own medications" on public.medications;
create policy "Users can update their own medications" on public.medications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own medications" on public.medications;
create policy "Users can delete their own medications" on public.medications for delete using (auth.uid() = user_id);
drop policy if exists "Users can read their own medication logs" on public.medication_logs;
create policy "Users can read their own medication logs" on public.medication_logs for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own medication logs" on public.medication_logs;
create policy "Users can create their own medication logs" on public.medication_logs for insert with check (auth.uid() = user_id);
drop policy if exists "Users can read their own medication changes" on public.medication_changes;
create policy "Users can read their own medication changes" on public.medication_changes for select using (auth.uid() = user_id);
drop policy if exists "Users can create their own medication changes" on public.medication_changes;
create policy "Users can create their own medication changes" on public.medication_changes for insert with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('medication-documents', 'medication-documents', false) on conflict (id) do nothing;
drop policy if exists "Users can upload their medication documents" on storage.objects;
create policy "Users can upload their medication documents" on storage.objects for insert with check (bucket_id = 'medication-documents' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Users can read their medication documents" on storage.objects;
create policy "Users can read their medication documents" on storage.objects for select using (bucket_id = 'medication-documents' and auth.uid()::text = (storage.foldername(name))[1]);

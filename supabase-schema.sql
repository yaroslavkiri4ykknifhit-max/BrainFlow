-- Supabase SQL Schema for BrainFlow
-- Run this in Supabase Dashboard → SQL Editor

create table dumps (
  id uuid default gen_random_uuid() primary key,
  raw_text text not null,
  created_at timestamptz default now()
);

create table items (
  id uuid default gen_random_uuid() primary key,
  dump_id uuid references dumps(id) on delete cascade,
  text text not null,
  category text not null check (category in ('task', 'goal', 'idea')),
  timeline text default null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Index for faster queries
create index idx_items_category on items(category);
create index idx_items_completed on items(completed);
create index idx_items_created_at on items(created_at);

-- RLS policies (public access for client-side app)
alter table dumps enable row level security;
alter table items enable row level security;
create policy "public_all_dumps" on dumps for all using (true) with check (true);
create policy "public_all_items" on items for all using (true) with check (true);

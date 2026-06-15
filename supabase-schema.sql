-- Выполни этот SQL в Supabase Dashboard → SQL Editor

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
  completed boolean default false,
  created_at timestamptz default now()
);

-- RLS policies (для публичного доступа из клиента)
alter table dumps enable row level security;
alter table items enable row level security;
create policy "public_all_dumps" on dumps for all using (true) with check (true);
create policy "public_all_items" on items for all using (true) with check (true);

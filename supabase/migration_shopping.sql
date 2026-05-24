create table if not exists shopping_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  quantity text,
  category text,
  checked boolean default false,
  added_at timestamptz default now()
);

alter table shopping_items enable row level security;
drop policy if exists "Users own their shopping items" on shopping_items;
create policy "Users own their shopping items" on shopping_items for all using (auth.uid() = user_id);

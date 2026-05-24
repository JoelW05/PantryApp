-- AI suggestion cache columns
alter table food_preferences
  add column if not exists meal_suggestions jsonb,
  add column if not exists shopping_suggestions jsonb,
  add column if not exists dismissed_meal_ids jsonb default '[]'::jsonb;

-- Budget + price columns (from previous migration)
alter table food_preferences add column if not exists shopping_budget numeric default 50;
alter table shopping_items add column if not exists price numeric;

-- Pantry category (from previous migration)
alter table pantry_items add column if not exists category text;

-- Nutrition flags — lets users report bad food data
create table if not exists nutrition_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  item_name text not null,
  open_food_facts_id text,
  created_at timestamptz default now()
);
alter table nutrition_flags enable row level security;
create policy "users can manage own flags" on nutrition_flags
  for all using (auth.uid() = user_id);

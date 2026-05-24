create table if not exists saved_recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  spoonacular_id int not null,
  title text not null,
  image text,
  ready_in_minutes int,
  servings int,
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  cuisine text,
  diet_tags text[] default '{}',
  saved_at timestamptz default now(),
  unique(user_id, spoonacular_id)
);

alter table saved_recipes enable row level security;
drop policy if exists "Users own their recipes" on saved_recipes;
create policy "Users own their recipes" on saved_recipes for all using (auth.uid() = user_id);

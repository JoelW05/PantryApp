-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users are managed by Supabase Auth; this extends their profile
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);

-- Nutrition goals per user
create table if not exists nutrition_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  calories int not null default 2000,
  protein_g int not null default 50,
  carbs_g int not null default 260,
  fat_g int not null default 70,
  fiber_g int not null default 30,
  sugar_g int,
  sodium_mg int,
  vitamin_c_mg int,
  vitamin_d_mcg int,
  iron_mg int,
  calcium_mg int,
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Food preferences
create table if not exists food_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  cuisine_types text[] default '{}',       -- e.g. ['Italian', 'Asian', 'Mexican']
  dietary_flags text[] default '{}',        -- e.g. ['vegetarian', 'gluten-free']
  disliked_ingredients text[] default '{}',
  max_cook_time_mins int default 60,
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Pantry items
create table if not exists pantry_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  brand text,
  quantity numeric not null default 1,
  unit text not null default 'unit',       -- g, ml, unit, tbsp, etc.
  calories_per_100g numeric,
  protein_per_100g numeric,
  carbs_per_100g numeric,
  fat_per_100g numeric,
  fiber_per_100g numeric,
  open_food_facts_id text,                  -- barcode / OFF product id
  expiry_date date,
  added_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Daily food intake log
create table if not exists intake_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  logged_at timestamptz not null default now(),
  meal_type text not null,                  -- breakfast, lunch, dinner, snack
  food_name text not null,
  quantity numeric not null,
  unit text not null default 'g',
  calories numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  recipe_id text,                           -- Spoonacular recipe id if from a recipe
  notes text
);

-- Schedule blocks (free time windows for cooking)
create table if not exists schedule_blocks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  label text,                               -- e.g. 'lunch break', 'evening free'
  is_cooking_window boolean default true
);

-- Sleep logs
create table if not exists sleep_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  sleep_start timestamptz not null,
  sleep_end timestamptz not null,
  quality int check (quality between 1 and 10),  -- self-reported 1–10
  notes text
);

-- Row-level security: users can only access their own data
alter table profiles enable row level security;
alter table nutrition_goals enable row level security;
alter table food_preferences enable row level security;
alter table pantry_items enable row level security;
alter table intake_logs enable row level security;
alter table schedule_blocks enable row level security;
alter table sleep_logs enable row level security;

drop policy if exists "Users own their profile" on profiles;
drop policy if exists "Users own their goals" on nutrition_goals;
drop policy if exists "Users own their preferences" on food_preferences;
drop policy if exists "Users own their pantry" on pantry_items;
drop policy if exists "Users own their intake" on intake_logs;
drop policy if exists "Users own their schedule" on schedule_blocks;
drop policy if exists "Users own their sleep" on sleep_logs;

create policy "Users own their profile" on profiles for all using (auth.uid() = id);
create policy "Users own their goals" on nutrition_goals for all using (auth.uid() = user_id);
create policy "Users own their preferences" on food_preferences for all using (auth.uid() = user_id);
create policy "Users own their pantry" on pantry_items for all using (auth.uid() = user_id);
create policy "Users own their intake" on intake_logs for all using (auth.uid() = user_id);
create policy "Users own their schedule" on schedule_blocks for all using (auth.uid() = user_id);
create policy "Users own their sleep" on sleep_logs for all using (auth.uid() = user_id);

-- Auto-create profile on sign-up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

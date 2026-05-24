alter table food_preferences add column if not exists shopping_budget numeric default 50;
alter table shopping_items add column if not exists price numeric;

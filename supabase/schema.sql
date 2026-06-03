-- Foodlab database schema
-- Run this in the Supabase SQL editor

-- Recipes (seed recipes have user_id = null)
create table if not exists recipes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  cat text not null check (cat in ('Ontbijt','Lunch','Diner','Tussendoor')),
  kcal integer not null default 0,
  eiwit integer not null default 0,
  vet integer not null default 0,
  kh integer not null default 0,
  time integer not null default 0,
  servings integer not null default 1,
  diff text not null default 'Makkelijk',
  img text,
  tags text[] not null default '{}',
  ingredients jsonb not null default '[]',
  steps text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;
create policy "anyone can read recipes" on recipes for select using (true);
create policy "users insert own recipes" on recipes for insert with check (auth.uid() = user_id);
create policy "users update own recipes" on recipes for update using (auth.uid() = user_id);
create policy "users delete own recipes" on recipes for delete using (auth.uid() = user_id);

-- Favorites
create table if not exists favorites (
  user_id uuid references auth.users(id) on delete cascade,
  recipe_id text references recipes(id) on delete cascade,
  primary key (user_id, recipe_id)
);

alter table favorites enable row level security;
create policy "users manage own favorites" on favorites using (auth.uid() = user_id);

-- Day plans
create table if not exists day_plans (
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  meal text not null check (meal in ('Ontbijt','Lunch','Diner','Tussendoor')),
  recipe_id text references recipes(id) on delete cascade,
  primary key (user_id, date, meal)
);

alter table day_plans enable row level security;
create policy "users manage own plans" on day_plans using (auth.uid() = user_id);

-- Macro goals
create table if not exists macro_goals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  kcal integer not null default 2100,
  eiwit integer not null default 140,
  vet integer not null default 70,
  kh integer not null default 210
);

alter table macro_goals enable row level security;
create policy "users manage own goals" on macro_goals using (auth.uid() = user_id);

-- Seed recipes (user_id = null = system recipes, readable by all)
insert into recipes (id, user_id, name, cat, kcal, eiwit, vet, kh, time, servings, diff, img, tags, ingredients, steps) values
('r1', null, 'Volkorenbrood met avocado en rosbief', 'Ontbijt', 442, 31, 15, 46, 10, 1, 'Makkelijk',
  'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=800&q=70',
  array['High-protein'],
  '[["2 sneden","volkorenbrood"],["1","avocado"],["80 g","rosbief"],["","peper & zout"],["1 tl","citroensap"]]',
  array['Rooster de sneden volkorenbrood licht.','Prak de avocado met citroensap, peper en zout.','Verdeel de avocado over het brood.','Leg de rosbief erop en breng op smaak.']),

('r2', null, 'Yoghurt met muesli en kersen', 'Ontbijt', 446, 22, 14, 58, 5, 1, 'Makkelijk',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=70',
  array['Vega'],
  '[["200 g","Griekse yoghurt"],["50 g","muesli"],["80 g","kersen"],["1 tl","honing"]]',
  array['Schep de yoghurt in een kom.','Voeg de muesli toe.','Verdeel de kersen erover.','Besprenkel met honing.']),

('r3', null, 'Overnight oats met banaan', 'Ontbijt', 380, 18, 9, 60, 5, 1, 'Makkelijk',
  'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=70',
  array['Vega','Meal-prep'],
  '[["50 g","havermout"],["150 ml","melk"],["1","banaan"],["1 el","chiazaad"]]',
  array['Meng havermout, melk en chiazaad.','Laat een nacht in de koelkast staan.','Snijd de banaan en voeg toe.']),

('r4', null, 'Pastasalade met aubergine en courgette', 'Lunch', 518, 19, 17, 72, 25, 2, 'Gemiddeld',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=70',
  array['Vega'],
  '[["200 g","volkoren pasta"],["1","aubergine"],["1","courgette"],["2 el","olijfolie"],["50 g","feta"]]',
  array['Kook de pasta beetgaar.','Snijd de groenten en bak ze goudbruin.','Meng pasta met de groenten.','Verkruimel de feta erover.']),

('r5', null, 'Rijstsalade met tofu, tomaat en olijven', 'Lunch', 523, 24, 18, 66, 20, 2, 'Makkelijk',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=70',
  array['Veganistisch','High-protein'],
  '[["150 g","zilvervliesrijst"],["200 g","tofu"],["2","tomaten"],["50 g","olijven"],["2 el","sojasaus"]]',
  array['Kook de rijst gaar.','Bak de tofu krokant in een pan.','Snijd tomaten en meng alles.','Breng op smaak met sojasaus.']),

('r6', null, 'Wrap met kip en hummus', 'Lunch', 420, 33, 13, 42, 12, 1, 'Makkelijk',
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=70',
  array['High-protein'],
  '[["1","volkoren wrap"],["100 g","kipfilet"],["2 el","hummus"],["handje","sla"],["1/2","komkommer"]]',
  array['Bak de kipfilet gaar en snijd in reepjes.','Besmeer de wrap met hummus.','Beleg met sla, komkommer en kip.','Rol stevig op.']),

('r7', null, 'Kip curry met mango en cashewnoten', 'Diner', 593, 41, 22, 48, 25, 2, 'Gemiddeld',
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=70',
  array['High-protein'],
  '[["300 g","kipfilet"],["1","mango"],["50 g","cashewnoten"],["200 ml","kokosmelk"],["2 el","currypasta"],["150 g","basmatirijst"]]',
  array['Kook de rijst volgens de verpakking.','Bak de kip met de currypasta aan.','Voeg kokosmelk toe en laat pruttelen.','Roer mango en cashewnoten erdoor en serveer met rijst.']),

('r8', null, 'Rode curry met kabeljauw', 'Diner', 595, 38, 24, 46, 30, 2, 'Gemiddeld',
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=70',
  array[]::text[],
  '[["300 g","kabeljauwfilet"],["2 el","rode currypasta"],["200 ml","kokosmelk"],["1","paprika"],["150 g","jasmijnrijst"]]',
  array['Kook de rijst gaar.','Fruit de currypasta en blus af met kokosmelk.','Voeg paprika toe en laat garen.','Leg de kabeljauw erin en pocheer 8 min.']),

('r9', null, 'Tikka masala met kikkererwten', 'Diner', 540, 25, 18, 64, 30, 2, 'Gemiddeld',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=70',
  array['Vega'],
  '[["400 g","kikkererwten"],["2 el","tikka masala pasta"],["200 ml","kokosmelk"],["1 blik","tomatenblokjes"],["150 g","rijst"]]',
  array['Kook de rijst.','Bak de pasta kort aan.','Voeg tomaat en kokosmelk toe.','Laat de kikkererwten 15 min meekoken.']),

('r10', null, 'Kwark met mandarijn en blauwe bessen', 'Tussendoor', 210, 24, 4, 18, 3, 1, 'Makkelijk',
  'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=70',
  array['High-protein','Vega'],
  '[["250 g","magere kwark"],["1","mandarijn"],["50 g","blauwe bessen"]]',
  array['Schep de kwark in een kom.','Verdeel de mandarijnpartjes erover.','Top af met blauwe bessen.']),

('r11', null, 'Crackers met kipfilet en komkommer', 'Tussendoor', 180, 16, 5, 18, 5, 1, 'Makkelijk',
  'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=70',
  array['High-protein'],
  '[["2","volkoren crackers"],["60 g","kipfilet"],["1/2","komkommer"],["","mosterd"]]',
  array['Besmeer de crackers met mosterd.','Beleg met kipfilet.','Leg er dunne plakjes komkommer op.'])

on conflict (id) do nothing;

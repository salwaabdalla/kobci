create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  business_name text,
  what_you_sell text,
  weekly_income numeric,
  biggest_challenge text,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text check (type in ('income', 'expense')),
  amount numeric,
  description text,
  date date,
  created_at timestamptz default now()
);

create table if not exists stock_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text,
  quantity numeric,
  reorder_level numeric,
  unit text,
  created_at timestamptz default now()
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  stock_item_id uuid references stock_items(id) on delete set null,
  item_name text,
  quantity numeric,
  amount numeric,
  date date,
  created_at timestamptz default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text,
  items text,
  phone text,
  created_at timestamptz default now()
);

create table if not exists supplier_prices (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id) on delete cascade,
  price numeric,
  date date,
  created_at timestamptz default now()
);

create table if not exists savings_goal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  target numeric,
  current numeric default 0,
  created_at timestamptz default now()
);

create table if not exists wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  text text,
  date date,
  created_at timestamptz default now()
);

create table if not exists streak (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  current_streak integer default 0,
  last_login_date date,
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('user', 'assistant')),
  content text,
  created_at timestamptz default now()
);

create table if not exists business_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  plan_text text,
  created_at timestamptz default now()
);

create table if not exists mentor_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  mentor_name text,
  mentor_business text,
  connected_at timestamptz default now()
);

create table if not exists pitch_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  pitch_text text,
  ai_feedback text,
  created_at timestamptz default now()
);

alter table users enable row level security;
alter table transactions enable row level security;
alter table stock_items enable row level security;
alter table sales enable row level security;
alter table suppliers enable row level security;
alter table supplier_prices enable row level security;
alter table savings_goal enable row level security;
alter table wins enable row level security;
alter table streak enable row level security;
alter table chat_messages enable row level security;
alter table business_plans enable row level security;
alter table mentor_connections enable row level security;
alter table pitch_feedback enable row level security;

drop policy if exists "own users" on users;
create policy "own users"
on users
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "own transactions" on transactions;
create policy "own transactions"
on transactions
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own stock" on stock_items;
create policy "own stock"
on stock_items
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own sales" on sales;
create policy "own sales"
on sales
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own suppliers" on suppliers;
create policy "own suppliers"
on suppliers
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own prices" on supplier_prices;
create policy "own prices"
on supplier_prices
for all
to authenticated
using (
  supplier_id in (select id from suppliers where user_id = auth.uid())
)
with check (
  supplier_id in (select id from suppliers where user_id = auth.uid())
);

drop policy if exists "own goal" on savings_goal;
create policy "own goal"
on savings_goal
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own wins" on wins;
create policy "own wins"
on wins
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own streak" on streak;
create policy "own streak"
on streak
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own messages" on chat_messages;
create policy "own messages"
on chat_messages
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own plans" on business_plans;
create policy "own plans"
on business_plans
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own connections" on mentor_connections;
create policy "own connections"
on mentor_connections
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "own pitches" on pitch_feedback;
create policy "own pitches"
on pitch_feedback
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table orders (
  id text primary key,
  created_at timestamptz default now(),
  name text, phone text, area text, address text, note text,
  items jsonb, subtotal int, delivery int, total int,
  payment text, trx_id text,
  status text default 'pending'
);
alter table orders enable row level security;

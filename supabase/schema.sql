create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  serial_number text not null unique,
  pin_code text not null,
  product_name text not null,
  batch_code text not null,
  production_date date,
  expired_date date,
  status text not null default 'active',
  scan_count integer not null default 0,
  first_scan_at timestamptz,
  last_scan_at timestamptz,
  first_scan_ip text,
  last_scan_ip text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists verification_logs (
  id uuid primary key default gen_random_uuid(),
  serial_number text not null,
  pin_input text not null,
  result text not null,
  scanned_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

create index if not exists products_serial_number_idx on products (serial_number);
create index if not exists products_scan_count_idx on products (scan_count);
create index if not exists verification_logs_serial_number_idx on verification_logs (serial_number);
create index if not exists verification_logs_scanned_at_idx on verification_logs (scanned_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
before update on products
for each row
execute function set_updated_at();

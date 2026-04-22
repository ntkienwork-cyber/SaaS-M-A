create table if not exists public.users (
  id          uuid        primary key default gen_random_uuid(),
  auth_id     text        unique not null,
  email       text        unique,
  phone       text        unique,
  name        text,
  avatar_url  text,
  provider    text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.users enable row level security;

-- Only the service-role key (used server-side by Next.js) can read/write rows.
create policy "service_role_full_access"
  on public.users
  for all
  to service_role
  using (true)
  with check (true);

-- Trigger to keep updated_at current.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

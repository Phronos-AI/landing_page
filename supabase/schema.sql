create extension if not exists pgcrypto;

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmation_sent_at timestamptz,
  confirmation_email_id text,
  confirmation_error text,
  constraint waitlist_signups_email_normalized check (email = lower(trim(email))),
  constraint waitlist_signups_email_unique unique (email)
);

alter table public.waitlist_signups enable row level security;

create or replace function public.set_waitlist_signups_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_waitlist_signups_updated_at on public.waitlist_signups;

create trigger set_waitlist_signups_updated_at
before update on public.waitlist_signups
for each row
execute function public.set_waitlist_signups_updated_at();

comment on table public.waitlist_signups is
  'Stores public waitlist signups submitted through the Netlify notify function.';

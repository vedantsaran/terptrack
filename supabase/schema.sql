create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default '',
  major_id text,
  major_name text,
  profile_prefs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists display_name text not null default '';
alter table public.profiles add column if not exists major_id text;
alter table public.profiles add column if not exists major_name text;
alter table public.profiles add column if not exists profile_prefs jsonb not null default '{}'::jsonb;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null default 'primary',
  name text not null default 'Primary TerpTrack plan',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  requester_email text not null default '',
  recipient_email text not null,
  recipient_id uuid references auth.users(id) on delete cascade,
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, recipient_email)
);

alter table public.friend_requests add column if not exists requester_email text not null default '';
alter table public.friend_requests add column if not exists recipient_id uuid references auth.users(id) on delete cascade;
alter table public.friend_requests add column if not exists note text not null default '';

create unique index if not exists friend_requests_requester_recipient_idx
  on public.friend_requests (requester_id, recipient_email);

create table if not exists public.shared_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null default 'primary',
  name text not null default 'Primary TerpTrack plan',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.friend_requests enable row level security;
alter table public.shared_plans enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "plans_select_own" on public.plans;
drop policy if exists "plans_insert_own" on public.plans;
drop policy if exists "plans_update_own" on public.plans;
drop policy if exists "plans_delete_own" on public.plans;

create policy "plans_select_own"
  on public.plans for select
  using (auth.uid() = user_id);

create policy "plans_insert_own"
  on public.plans for insert
  with check (auth.uid() = user_id);

create policy "plans_update_own"
  on public.plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "plans_delete_own"
  on public.plans for delete
  using (auth.uid() = user_id);

drop policy if exists "friend_requests_select_visible" on public.friend_requests;
drop policy if exists "friend_requests_insert_own" on public.friend_requests;
drop policy if exists "friend_requests_update_pending_by_requester" on public.friend_requests;
drop policy if exists "friend_requests_update_by_recipient" on public.friend_requests;
drop policy if exists "friend_requests_delete_requester" on public.friend_requests;

create policy "friend_requests_select_visible"
  on public.friend_requests for select
  using (
    auth.uid() = requester_id
    or auth.uid() = recipient_id
    or lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "friend_requests_insert_own"
  on public.friend_requests for insert
  with check (
    auth.uid() = requester_id
    and status = 'pending'
    and recipient_id is null
    and lower(recipient_email) <> lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "friend_requests_update_pending_by_requester"
  on public.friend_requests for update
  using (auth.uid() = requester_id and status = 'pending')
  with check (
    auth.uid() = requester_id
    and status = 'pending'
    and recipient_id is null
    and lower(recipient_email) <> lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "friend_requests_update_by_recipient"
  on public.friend_requests for update
  using (lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (
    lower(recipient_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and recipient_id = auth.uid()
    and status in ('accepted', 'declined')
  );

create policy "friend_requests_delete_requester"
  on public.friend_requests for delete
  using (auth.uid() = requester_id);

drop policy if exists "shared_plans_select_visible" on public.shared_plans;
drop policy if exists "shared_plans_insert_own" on public.shared_plans;
drop policy if exists "shared_plans_update_own" on public.shared_plans;
drop policy if exists "shared_plans_delete_own" on public.shared_plans;

create policy "shared_plans_select_visible"
  on public.shared_plans for select
  using (
    auth.uid() = owner_id
    or exists (
      select 1
      from public.friend_requests fr
      where fr.status = 'accepted'
        and fr.recipient_id is not null
        and (
          (fr.requester_id = public.shared_plans.owner_id and fr.recipient_id = auth.uid())
          or (fr.recipient_id = public.shared_plans.owner_id and fr.requester_id = auth.uid())
        )
    )
  );

create policy "shared_plans_insert_own"
  on public.shared_plans for insert
  with check (auth.uid() = owner_id);

create policy "shared_plans_update_own"
  on public.shared_plans for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "shared_plans_delete_own"
  on public.shared_plans for delete
  using (auth.uid() = owner_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

drop trigger if exists friend_requests_set_updated_at on public.friend_requests;
create trigger friend_requests_set_updated_at
before update on public.friend_requests
for each row execute function public.set_updated_at();

drop trigger if exists shared_plans_set_updated_at on public.shared_plans;
create trigger shared_plans_set_updated_at
before update on public.shared_plans
for each row execute function public.set_updated_at();

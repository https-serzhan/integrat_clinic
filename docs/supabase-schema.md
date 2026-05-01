# Supabase Reset Schema

Delete the old tables, then run this full reset SQL in Supabase SQL Editor.

```sql
create extension if not exists pgcrypto;

-- reset order matters because of foreign keys

drop table if exists public.course_access cascade;
drop table if exists public.payment_requests cascade;
drop table if exists public.payment_settings cascade;
drop table if exists public.contacts cascade;
drop table if exists public.courses cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  email text not null unique,
  full_name text not null,
  phone text,
  password_hash text not null,
  role text not null default 'student'
    check (role in ('student', 'patient', 'admin')),
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'ru')),
  is_active boolean not null default true,
  source text not null default 'app',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_phone_format_chk
    check (phone is null or phone ~ '^7[0-9]{10}$')
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  comment text not null,
  created_at timestamptz not null default now(),
  constraint contacts_phone_number_format_chk
    check (phone_number ~ '^7[0-9]{10}$')
);

create table public.courses (
  id text primary key,
  title text not null,
  description text not null default '',
  price numeric(12,2) not null default 0,
  price_label text,
  currency text not null default 'USD',
  badge text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_settings (
  provider text primary key,
  receiver_name text not null,
  receiver_number text not null,
  instructions text not null,
  updated_at timestamptz not null default now()
);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  course_title text,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  payment_provider text not null default 'kaspi',
  request_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_note text,
  unique (user_id, course_id)
);

create table public.course_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  source text not null default 'admin-approval',
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index profiles_email_idx on public.profiles(email);
create index profiles_role_idx on public.profiles(role);
create index payment_requests_user_idx on public.payment_requests(user_id);
create index payment_requests_course_idx on public.payment_requests(course_id);
create index payment_requests_status_idx on public.payment_requests(status);
create index course_access_user_idx on public.course_access(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger courses_set_updated_at
before update on public.courses
for each row
execute function public.set_updated_at();

-- public catalog + manager settings
insert into public.payment_settings (provider, receiver_name, receiver_number, instructions)
values (
  'kaspi',
  'Serzhan S.',
  '+77711140710',
  'Transfer the course amount to this Kaspi number, then press "Send payment request" in Academy so the manager can approve access.'
)
on conflict (provider) do update set
  receiver_name = excluded.receiver_name,
  receiver_number = excluded.receiver_number,
  instructions = excluded.instructions,
  updated_at = now();

insert into public.courses (id, title, description, price, price_label, currency, badge, category)
values
  ('endo-faq', 'FAQ in Endodontics - Part I', 'Clinical decision making for diagnosis, access, irrigation, shaping, and complication prevention in endodontics.', 139, '$139', 'USD', 'Best seller', 'endodontics'),
  ('implant-lab', 'Precision Implant Lab', 'Treatment planning, implant positioning, restoration sequencing, and communication between surgery and prosthetics.', 259, '$259', 'USD', 'Hands-on', 'implants'),
  ('digital-smile', 'Digital Smile Workflow', 'Digital scan-to-design workflow for smile planning, mockups, and esthetic case presentation.', 189, '$189', 'USD', 'New', 'digital dentistry'),
  ('occlusion-protocols', 'Occlusion Protocols', 'Occlusal analysis, functional risk reduction, and interdisciplinary planning for complex restorative cases.', 229, '$229', 'USD', 'Advanced', 'occlusion')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  price = excluded.price,
  price_label = excluded.price_label,
  currency = excluded.currency,
  badge = excluded.badge,
  category = excluded.category,
  updated_at = now();

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.courses enable row level security;
alter table public.payment_settings enable row level security;
alter table public.payment_requests enable row level security;
alter table public.course_access enable row level security;

-- the backend uses the service role key, which bypasses RLS.
-- these read policies are only for safe public reads if you ever need them later.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'courses' and policyname = 'courses_select_all'
  ) then
    create policy courses_select_all
      on public.courses
      for select
      using (is_active = true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'payment_settings' and policyname = 'payment_settings_select_all'
  ) then
    create policy payment_settings_select_all
      on public.payment_settings
      for select
      using (true);
  end if;
end $$;
```

## Required `.env`

Use these backend values after the reset:

```env
SUPABASE_SYNC_ENABLED=1
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROFILES_TABLE=profiles
SUPABASE_PROFILE_ID_COLUMN=id
SUPABASE_CONTACTS_TABLE=contacts
SUPABASE_COURSES_TABLE=courses
SUPABASE_PAYMENT_REQUESTS_TABLE=payment_requests
SUPABASE_PAYMENT_SETTINGS_TABLE=payment_settings
SUPABASE_COURSE_ACCESS_TABLE=course_access
```

## Admin Setup

Do not manually invent `password_hash` values.
Use this flow instead:

1. Sign up through the academy UI with the future admin email.
2. In Supabase SQL editor, promote that row:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

3. Log out and log back in.

## What This Fixes

- `payment_requests.id` is UUID-backed, so inserts no longer fail on values like `pay_...`
- `payment_requests.user_id`, `reviewed_by`, and `course_access.user_id` all reference `profiles.id` cleanly
- one user can request each course only once because of `unique (user_id, course_id)`
- contact form stores only `full_name`, `phone_number`, and `comment`

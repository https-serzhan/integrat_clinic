create table if not exists public.profiles (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  role text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id text primary key,
  fullname text not null,
  phone text not null,
  comment text not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id text primary key,
  patient_id text not null,
  patient_email text not null,
  patient_name text not null,
  patient_phone text,
  doctor_id integer not null,
  doctor_name text not null,
  datetime timestamptz not null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table if not exists public.payment_requests (
  id text primary key,
  user_id text not null,
  user_email text not null,
  user_name text not null,
  user_phone text,
  course_id text not null,
  course_title text not null,
  amount numeric not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending',
  request_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.course_access (
  user_id text not null,
  course_id text not null,
  payment_request_id text,
  granted_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.appointments enable row level security;
alter table public.payment_requests enable row level security;
alter table public.course_access enable row level security;

insert into public.profiles (id, name, email, phone, role, created_at)
values (
  'usr_admin_seed',
  'Integrat Admin',
  'admin@integrat.local',
  '+77711140710',
  'admin',
  now()
)
on conflict (id) do update
set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  role = excluded.role;

create table if not exists users (
  id serial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  user_type text not null check (user_type in ('business', 'individual')),
  company text,
  is_verified boolean not null default false,
  verification_token text,
  created_at timestamptz not null default now()
);

create index if not exists users_verification_token_idx on users (verification_token);

-- Profile fields
alter table users add column if not exists phone text;
alter table users add column if not exists address text;
alter table users add column if not exists avatar_url text;

-- Password reset
alter table users add column if not exists reset_token text;
alter table users add column if not exists reset_token_expires timestamptz;

create index if not exists users_reset_token_idx on users (reset_token);

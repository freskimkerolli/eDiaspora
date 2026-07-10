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

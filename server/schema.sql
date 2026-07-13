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

-- Listings posted by users
create table if not exists posts (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  title text not null,
  category text not null,
  subcategory text not null,
  type text not null,
  description text not null,
  price text not null,
  photos text[] not null default '{}',
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_category_idx on posts (category);
create index if not exists posts_user_id_idx on posts (user_id);

-- Completed-work portfolio entries shown on a user's public profile
create table if not exists completed_works (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  description text not null,
  photos text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists completed_works_user_id_idx on completed_works (user_id);

-- Contact messages sent through a business's public profile
create table if not exists contact_messages (
  id serial primary key,
  recipient_user_id integer not null references users(id) on delete cascade,
  sender_name text not null,
  sender_contact text not null,
  message text not null,
  reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_recipient_idx on contact_messages (recipient_user_id);

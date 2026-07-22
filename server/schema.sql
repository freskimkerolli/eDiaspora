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

-- Thread token lets the anonymous sender (no account) view/reply to a thread
alter table contact_messages add column if not exists thread_token text;
create unique index if not exists contact_messages_thread_token_idx on contact_messages (thread_token);

-- Multi-message thread on top of a contact_messages "conversation"
create table if not exists message_replies (
  id serial primary key,
  contact_message_id integer not null references contact_messages(id) on delete cascade,
  sender text not null check (sender in ('recipient', 'sender')),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists message_replies_message_idx on message_replies (contact_message_id);

-- Admin flag + business trust badge (separate from email verification)
alter table users add column if not exists is_admin boolean not null default false;
alter table users add column if not exists business_verified boolean not null default false;

-- Location, promotion and lifecycle fields for listings
alter table posts add column if not exists city text;
alter table posts add column if not exists country text;
alter table posts add column if not exists featured boolean not null default false;
alter table posts add column if not exists expires_at timestamptz not null default (now() + interval '60 days');
alter table posts add column if not exists status text not null default 'active';
alter table posts add column if not exists renewed_at timestamptz;

create index if not exists posts_city_idx on posts (city);
create index if not exists posts_featured_idx on posts (featured);
create index if not exists posts_status_idx on posts (status);

-- Favorites (saved listings)
create table if not exists favorites (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  post_id integer not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index if not exists favorites_user_idx on favorites (user_id);

-- Reviews / ratings left on a business's public profile
create table if not exists reviews (
  id serial primary key,
  target_user_id integer not null references users(id) on delete cascade,
  reviewer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_target_idx on reviews (target_user_id);

-- Reports / flags on listings, for moderation
create table if not exists reports (
  id serial primary key,
  post_id integer not null references posts(id) on delete cascade,
  reporter_name text,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists reports_status_idx on reports (status);

-- Add users table if not exists
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb
);

-- Add user_id to chat_sessions if not exists
alter table chat_sessions
add column if not exists user_id uuid references users(id);

-- Update messages table to include category
alter table messages
add column if not exists category text check (category in ('REPORT_ISSUE', 'CONTRIBUTE_IDEA', 'ASK_QUESTION'));

-- Create index for user lookup
create index if not exists idx_users_email on users(email);

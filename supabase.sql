-- Create tables for chat storage
create table chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  status text default 'active'::text,
  metadata jsonb default '{}'::jsonb
);

create table messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references chat_sessions(id),
  role text not null,
  content text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  sentiment text,
  topics text[],
  metadata jsonb default '{}'::jsonb
);

-- Create indexes for better query performance
create index idx_messages_session_id on messages(session_id);
create index idx_messages_timestamp on messages(timestamp);
create index idx_messages_sentiment on messages(sentiment);
create index idx_chat_sessions_status on chat_sessions(status);

-- Create a view for session analytics
create view session_analytics as
select 
  cs.id as session_id,
  cs.started_at,
  cs.ended_at,
  cs.status,
  count(m.id) as message_count,
  array_agg(distinct m.sentiment) as sentiments,
  array_agg(distinct unnest(m.topics)) as topics
from chat_sessions cs
left join messages m on cs.id = m.session_id
group by cs.id;

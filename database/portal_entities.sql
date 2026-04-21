-- Portal InovaScript - modelo de entidades operacionais
-- Este arquivo documenta o banco usado pelo portal neste momento.
-- No frontend, "servico" e "projeto" usam a tabela fisica public.projects.

create extension if not exists pgcrypto;

create table if not exists public.client_users (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'cliente',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, profile_id)
);

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  author_role text not null check (author_role in ('admin', 'cliente')),
  mensagem text not null,
  visivel_cliente boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  titulo text not null,
  url text not null,
  tipo text not null default 'link',
  visivel_cliente boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  acao text not null,
  detalhes jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_users_client_id on public.client_users(client_id);
create index if not exists idx_client_users_profile_id on public.client_users(profile_id);
create index if not exists idx_conversation_messages_project_id on public.conversation_messages(project_id);
create index if not exists idx_attachments_project_id on public.attachments(project_id);
create index if not exists idx_activity_logs_project_id on public.activity_logs(project_id);

-- ATLAS Knowledge Center — database setup
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste this → Run)

-- pgvector for embedding similarity search
create extension if not exists vector;

-- gen_random_uuid() support
create extension if not exists pgcrypto;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  uploaded_by text,
  uploaded_at timestamptz not null default now(),
  chunk_count int not null default 0
);

create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(768),
  created_at timestamptz not null default now()
);

-- Approximate nearest-neighbor index for fast cosine similarity search.
-- ivfflat needs some rows to build well; with only a handful of test
-- documents this still works, just without much speed benefit yet —
-- that's expected and fine for a hackathon dataset size.
create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists document_chunks_document_id_idx
  on document_chunks (document_id);
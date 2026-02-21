-- Migration: 005_create_design_tokens
-- Stores semantic design token definitions for runtime theming

create table public.design_tokens (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  category text not null
    constraint design_tokens_category_check check (category in ('color', 'typography', 'spacing', 'radius', 'shadow')),
  light_value text not null,
  dark_value text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.design_tokens is 'Semantic design token definitions. Seeded from Style Dictionary. Enables runtime theming in later phases.';
comment on column public.design_tokens.key is 'Dot-notation path: color.primary, text.body.size';

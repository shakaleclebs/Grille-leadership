-- Référentiel — joueurs, votes et accès administrateur.
-- Toutes les règles de vote sont vérifiées ici, côté base, et pas seulement
-- dans le navigateur.

-- ── Joueurs ────────────────────────────────────────────────────────────
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (length(btrim(first_name)) > 0),
  last_name  text not null check (length(btrim(last_name))  > 0),
  created_at timestamptz not null default now()
);

-- ── Votes ──────────────────────────────────────────────────────────────
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references public.players(id) on delete cascade,
  subcompetence_id text not null,
  rank_1_player_id uuid not null references public.players(id) on delete cascade,
  rank_2_player_id uuid not null references public.players(id) on delete cascade,
  rank_3_player_id uuid not null references public.players(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Un seul vote par joueur et par sous-compétence.
  constraint votes_un_vote_par_sous_competence unique (voter_id, subcompetence_id),

  -- Le format des identifiants de sous-compétence du référentiel.
  constraint votes_subcompetence_format
    check (subcompetence_id ~ '^(tache|motivation)-[0-9]+-sous-[0-9]+$'),

  -- Les trois joueurs du podium doivent être différents.
  constraint votes_podium_distinct check (
    rank_1_player_id <> rank_2_player_id and
    rank_1_player_id <> rank_3_player_id and
    rank_2_player_id <> rank_3_player_id
  ),

  -- Un joueur ne peut pas voter pour lui-même.
  constraint votes_pas_d_auto_vote check (
    voter_id <> rank_1_player_id and
    voter_id <> rank_2_player_id and
    voter_id <> rank_3_player_id
  )
);

create index if not exists votes_subcompetence_idx on public.votes (subcompetence_id);

-- ── Code administrateur ────────────────────────────────────────────────
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

-- ── Sécurité ───────────────────────────────────────────────────────────
alter table public.players   enable row level security;
alter table public.votes     enable row level security;
alter table public.app_config enable row level security;

-- L'application lit l'effectif et enregistre les votes ; elle ne peut ni
-- modifier ni supprimer quoi que ce soit, et ne peut pas lire app_config.
drop policy if exists players_lecture on public.players;
create policy players_lecture on public.players for select to anon, authenticated using (true);

drop policy if exists votes_lecture on public.votes;
create policy votes_lecture on public.votes for select to anon, authenticated using (true);

drop policy if exists votes_enregistrement on public.votes;
create policy votes_enregistrement on public.votes for insert to anon, authenticated with check (true);

-- ── Gestion de l'effectif, réservée à l'administrateur ─────────────────
-- Ces fonctions sont le seul moyen d'écrire dans players : elles exigent
-- le code administrateur, vérifié ici même.
create or replace function public.verify_admin_code(code text)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from app_config where key = 'admin_code' and value = code);
$$;

create or replace function public.admin_add_player(code text, p_first_name text, p_last_name text)
returns public.players language plpgsql security definer set search_path = public as $$
declare nouveau public.players;
begin
  if not verify_admin_code(code) then raise exception 'Code administrateur invalide'; end if;
  insert into players (first_name, last_name)
  values (btrim(p_first_name), btrim(p_last_name))
  returning * into nouveau;
  return nouveau;
end; $$;

create or replace function public.admin_update_player(code text, p_id uuid, p_first_name text, p_last_name text)
returns public.players language plpgsql security definer set search_path = public as $$
declare modifie public.players;
begin
  if not verify_admin_code(code) then raise exception 'Code administrateur invalide'; end if;
  update players set first_name = btrim(p_first_name), last_name = btrim(p_last_name)
  where id = p_id returning * into modifie;
  return modifie;
end; $$;

create or replace function public.admin_delete_player(code text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not verify_admin_code(code) then raise exception 'Code administrateur invalide'; end if;
  delete from players where id = p_id;
end; $$;

revoke all on function public.verify_admin_code(text) from public;
revoke all on function public.admin_add_player(text, text, text) from public;
revoke all on function public.admin_update_player(text, uuid, text, text) from public;
revoke all on function public.admin_delete_player(text, uuid) from public;
grant execute on function public.verify_admin_code(text) to anon, authenticated;
grant execute on function public.admin_add_player(text, text, text) to anon, authenticated;
grant execute on function public.admin_update_player(text, uuid, text, text) to anon, authenticated;
grant execute on function public.admin_delete_player(text, uuid) to anon, authenticated;

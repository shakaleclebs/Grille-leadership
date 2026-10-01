// Accès à la base Supabase via son API REST, avec le fetch de Next.js.
// Aucune dépendance supplémentaire n'est nécessaire.
//
// Les règles de vote sont garanties par la base elle-même (contraintes SQL),
// et l'écriture dans l'effectif passe par des fonctions protégées par le code
// administrateur. Ce module n'est utilisé que côté serveur.

import { SUPABASE_KEY, SUPABASE_URL } from "./config";

const REST = `${SUPABASE_URL}/rest/v1`;
const entetes = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

// Code = code d'erreur PostgreSQL (23505 = doublon, 23514 = contrainte refusée).
export type DbError = { code: string; message: string };

async function lireErreur(res: Response): Promise<DbError> {
  const corps = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
  return {
    code: corps?.code ?? String(res.status),
    message: corps?.message ?? `Erreur ${res.status}`,
  };
}

// Lecture. `requete` est un chemin PostgREST, par exemple
// "players?select=id,first_name&order=last_name.asc".
export async function dbSelect<T>(requete: string): Promise<T[]> {
  const res = await fetch(`${REST}/${requete}`, { headers: entetes, cache: "no-store" });
  if (!res.ok) throw new Error((await lireErreur(res)).message);
  return (await res.json()) as T[];
}

// Écriture. Renvoie null si tout s'est bien passé, l'erreur sinon.
export async function dbInsert(
  table: string,
  ligne: Record<string, unknown>,
): Promise<DbError | null> {
  const res = await fetch(`${REST}/${table}`, {
    method: "POST",
    headers: { ...entetes, Prefer: "return=minimal" },
    body: JSON.stringify(ligne),
  });
  return res.ok ? null : lireErreur(res);
}

// Appel d'une fonction de la base (gestion de l'effectif, code administrateur).
export async function dbRpc<T>(
  nom: string,
  args: Record<string, unknown>,
): Promise<{ data: T | null; error: DbError | null }> {
  const res = await fetch(`${REST}/rpc/${nom}`, {
    method: "POST",
    headers: entetes,
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) return { data: null, error: await lireErreur(res) };
  return { data: (await res.json().catch(() => null)) as T | null, error: null };
}

export type Player = {
  id: string;
  first_name: string;
  last_name: string;
};

export type Vote = {
  voter_id: string;
  subcompetence_id: string;
  rank_1_player_id: string;
  rank_2_player_id: string;
  rank_3_player_id: string;
};

// Points attribués par position. Ils ne servent qu'aux résultats
// administrateur et ne sont jamais montrés au joueur qui vote.
export const POINTS = { rank1: 3, rank2: 2, rank3: 1 } as const;

export function playerName(p: Player) {
  return `${p.first_name} ${p.last_name}`;
}

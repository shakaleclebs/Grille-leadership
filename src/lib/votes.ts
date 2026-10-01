import { cookies } from "next/headers";
import { POINTS, dbRpc, dbSelect, playerName, type Player, type Vote } from "./supabase";

export const VOTER_COOKIE = "voter_id";
export const ADMIN_COOKIE = "admin_code";

const CHAMPS_JOUEUR = "id,first_name,last_name";

// ── Effectif ───────────────────────────────────────────────────────────
export async function getPlayers(): Promise<Player[]> {
  return dbSelect<Player>(
    `players?select=${CHAMPS_JOUEUR}&order=last_name.asc,first_name.asc`,
  );
}

// Le joueur qui vote, identifié par un simple cookie. Renvoie null si le
// cookie est absent ou pointe vers un joueur qui n'existe plus.
export async function getCurrentPlayer(): Promise<Player | null> {
  const id = (await cookies()).get(VOTER_COOKIE)?.value;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const lignes = await dbSelect<Player>(`players?select=${CHAMPS_JOUEUR}&id=eq.${id}`);
  return lignes[0] ?? null;
}

// Sous-compétences déjà évaluées par ce joueur.
export async function getVotedSubIds(voterId: string): Promise<Set<string>> {
  const lignes = await dbSelect<{ subcompetence_id: string }>(
    `votes?select=subcompetence_id&voter_id=eq.${voterId}`,
  );
  return new Set(lignes.map((v) => v.subcompetence_id));
}

// ── Résultats (espace administrateur uniquement) ───────────────────────
export type RankingRow = {
  rank: number;
  player: string;
  points: number;
};

export type SubResults = {
  subId: string;
  voteCount: number;
  ranking: RankingRow[];
};

// Classement par sous-compétence : Top 1 = 3 pts, Top 2 = 2 pts, Top 3 = 1 pt.
// Les joueurs à égalité partagent le même rang.
export async function getResults(subIds: string[]): Promise<Map<string, SubResults>> {
  const [players, votes] = await Promise.all([
    getPlayers(),
    dbSelect<Vote>(
      "votes?select=voter_id,subcompetence_id,rank_1_player_id,rank_2_player_id,rank_3_player_id" +
        `&subcompetence_id=in.(${subIds.join(",")})`,
    ),
  ]);

  const names = new Map(players.map((p) => [p.id, playerName(p)]));
  const results = new Map<string, SubResults>(
    subIds.map((id) => [id, { subId: id, voteCount: 0, ranking: [] }]),
  );
  const totals = new Map<string, Map<string, number>>(subIds.map((id) => [id, new Map()]));

  for (const vote of votes) {
    const entry = results.get(vote.subcompetence_id);
    const points = totals.get(vote.subcompetence_id);
    if (!entry || !points) continue;
    entry.voteCount += 1;
    const add = (playerId: string, value: number) =>
      points.set(playerId, (points.get(playerId) ?? 0) + value);
    add(vote.rank_1_player_id, POINTS.rank1);
    add(vote.rank_2_player_id, POINTS.rank2);
    add(vote.rank_3_player_id, POINTS.rank3);
  }

  for (const [subId, points] of totals) {
    const classe = [...points.entries()]
      .map(([id, value]) => ({ player: names.get(id) ?? "Joueur supprimé", points: value }))
      .sort((a, b) => b.points - a.points || a.player.localeCompare(b.player, "fr"));

    let rang = 0;
    let precedent: number | null = null;
    results.get(subId)!.ranking = classe.map((row, index) => {
      if (precedent === null || row.points !== precedent) rang = index + 1;
      precedent = row.points;
      return { rank: rang, ...row };
    });
  }

  return results;
}

// ── Administrateur ─────────────────────────────────────────────────────
export async function getAdminCode(): Promise<string | null> {
  return (await cookies()).get(ADMIN_COOKIE)?.value ?? null;
}

export async function isAdmin(): Promise<boolean> {
  const code = await getAdminCode();
  if (!code) return false;
  const { data } = await dbRpc<boolean>("verify_admin_code", { code });
  return data === true;
}

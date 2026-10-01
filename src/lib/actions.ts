"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { competences, getCompetence } from "@/data/competences";
import { dbInsert, dbRpc } from "./supabase";
import { ADMIN_COOKIE, VOTER_COOKIE, getAdminCode, getCurrentPlayer, getPlayers } from "./votes";

const UN_AN = 60 * 60 * 24 * 365;

export type FormState = { error?: string };

// ── Identification du joueur qui vote ──────────────────────────────────
export async function selectVoter(_state: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get("playerId") ?? "");
  const players = await getPlayers();
  if (!players.some((p) => p.id === id)) {
    return { error: "Choisis ton nom dans la liste." };
  }
  (await cookies()).set(VOTER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: UN_AN,
  });
  redirect("/");
}

export async function forgetVoter(): Promise<void> {
  (await cookies()).delete(VOTER_COOKIE);
  redirect("/joueur");
}

// ── Enregistrement d'un vote ───────────────────────────────────────────
// Ces vérifications doublent celles de la base : la base reste l'autorité.
export async function submitVote(_state: FormState, formData: FormData): Promise<FormState> {
  const competenceId = String(formData.get("competenceId") ?? "");
  const subId = String(formData.get("subId") ?? "");
  const ranks = [1, 2, 3].map((n) => String(formData.get(`rank${n}`) ?? ""));

  const competence = getCompetence(competenceId);
  const sub = competence?.subCompetencies.find((s) => s.id === subId);
  if (!competence || !sub) return { error: "Sous-compétence inconnue." };

  const voter = await getCurrentPlayer();
  if (!voter) redirect("/joueur");

  if (ranks.some((r) => !r)) return { error: "Choisis un joueur pour chacune des 3 positions." };
  if (new Set(ranks).size !== 3) return { error: "Les 3 joueurs doivent être différents." };
  if (ranks.includes(voter.id)) return { error: "Tu ne peux pas voter pour toi-même." };

  const players = await getPlayers();
  if (!ranks.every((r) => players.some((p) => p.id === r))) {
    return { error: "Un des joueurs choisis n'existe plus." };
  }

  const error = await dbInsert("votes", {
    voter_id: voter.id,
    subcompetence_id: subId,
    rank_1_player_id: ranks[0],
    rank_2_player_id: ranks[1],
    rank_3_player_id: ranks[2],
  });

  if (error) {
    // 23505 = doublon (un seul vote par sous-compétence),
    // 23514 = une contrainte de la base a refusé le vote.
    if (error.code === "23505") return { error: "Tu as déjà évalué cette sous-compétence." };
    if (error.code === "23514") return { error: "Ce classement ne respecte pas les règles de vote." };
    return { error: "Enregistrement impossible : " + error.message };
  }

  revalidatePath(`/${competenceId}`);
  revalidatePath(`/${competenceId}/${subId}`);
  redirect(`/${competenceId}`);
}

// ── Administrateur ─────────────────────────────────────────────────────
export async function adminLogin(_state: FormState, formData: FormData): Promise<FormState> {
  const code = String(formData.get("code") ?? "");
  const { data } = await dbRpc<boolean>("verify_admin_code", { code });
  if (data !== true) return { error: "Code incorrect." };
  (await cookies()).set(ADMIN_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: UN_AN,
  });
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin");
}

async function requireCode(): Promise<string> {
  const code = await getAdminCode();
  if (!code) redirect("/admin");
  return code;
}

export async function addPlayer(_state: FormState, formData: FormData): Promise<FormState> {
  const code = await requireCode();
  const first = String(formData.get("firstName") ?? "").trim();
  const last = String(formData.get("lastName") ?? "").trim();
  if (!first || !last) return { error: "Prénom et nom sont obligatoires." };

  const { error } = await dbRpc("admin_add_player", {
    code,
    p_first_name: first,
    p_last_name: last,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/joueurs");
  return {};
}

export async function updatePlayer(_state: FormState, formData: FormData): Promise<FormState> {
  const code = await requireCode();
  const id = String(formData.get("playerId") ?? "");
  const first = String(formData.get("firstName") ?? "").trim();
  const last = String(formData.get("lastName") ?? "").trim();
  if (!first || !last) return { error: "Prénom et nom sont obligatoires." };

  const { error } = await dbRpc("admin_update_player", {
    code,
    p_id: id,
    p_first_name: first,
    p_last_name: last,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/joueurs");
  return {};
}

export async function deletePlayer(_state: FormState, formData: FormData): Promise<FormState> {
  const code = await requireCode();
  const id = String(formData.get("playerId") ?? "");
  const { error } = await dbRpc("admin_delete_player", { code, p_id: id });
  if (error) return { error: error.message };
  revalidatePath("/admin/joueurs");
  for (const c of competences) revalidatePath(`/admin/${c.id}`);
  return {};
}

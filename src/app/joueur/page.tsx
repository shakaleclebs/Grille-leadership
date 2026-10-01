import PlayerPicker from "@/components/PlayerPicker";
import { playerName } from "@/lib/supabase";
import { getPlayers } from "@/lib/votes";

export const dynamic = "force-dynamic";

export default async function JoueurPage() {
  const players = await getPlayers();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Qui es-tu ?</h1>
        <p className="mt-1 text-base text-ink/70">
          Choisis ton nom pour commencer tes évaluations.
        </p>
      </div>

      {players.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-base text-ink/70">
          Aucun joueur dans l&apos;effectif pour l&apos;instant. L&apos;administrateur doit
          d&apos;abord ajouter les joueurs du groupe.
        </p>
      ) : (
        <PlayerPicker players={players.map((p) => ({ id: p.id, name: playerName(p) }))} />
      )}
    </main>
  );
}

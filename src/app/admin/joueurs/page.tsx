import { redirect } from "next/navigation";
import BackLink from "@/components/BackLink";
import PlayerAdmin from "@/components/PlayerAdmin";
import { getPlayers, isAdmin } from "@/lib/votes";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  if (!(await isAdmin())) redirect("/admin");
  const players = await getPlayers();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 px-4 py-4">
      <div>
        <BackLink href="/admin" label="Résultats" />
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Effectif</h1>
        <p className="mt-1 text-base text-ink/70">
          Les joueurs de cette liste alimentent les menus de vote.
        </p>
      </div>
      <PlayerAdmin players={players} />
    </main>
  );
}

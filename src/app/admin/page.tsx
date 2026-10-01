import Link from "next/link";
import AdminLogin from "@/components/AdminLogin";
import { familyInk } from "@/components/theme";
import { adminLogout } from "@/lib/actions";
import { competences, type Category } from "@/data/competences";
import { getResults, isAdmin } from "@/lib/votes";

export const dynamic = "force-dynamic";

// Intitulés de l'espace administrateur.
const titresFamille: Record<Category, string> = {
  tache: "Leader Tâche",
  motivation: "Leader Motivation",
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Espace administrateur</h1>
          <p className="mt-1 text-base text-ink/70">Résultats des évaluations du groupe.</p>
        </div>
        <AdminLogin />
      </main>
    );
  }

  const allSubIds = competences.flatMap((c) => c.subCompetencies.map((s) => s.id));
  const results = await getResults(allSubIds);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-6">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Résultats</h1>
        <Link href="/admin/joueurs" className="text-sm underline underline-offset-2">
          Effectif
        </Link>
      </div>

      {(["tache", "motivation"] as Category[]).map((category) => (
        <section key={category} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold" style={{ color: familyInk[category] }}>
            {titresFamille[category]}
          </h2>
          {competences
            .filter((c) => c.category === category)
            .map((c) => {
              const votes = c.subCompetencies.reduce(
                (total, s) => total + (results.get(s.id)?.voteCount ?? 0),
                0,
              );
              return (
                <Link
                  key={c.id}
                  href={`/admin/${c.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3"
                >
                  <span className="text-lg font-semibold">{c.title}</span>
                  <span className="shrink-0 text-sm text-ink/60">
                    {votes} vote{votes > 1 ? "s" : ""}
                  </span>
                </Link>
              );
            })}
        </section>
      ))}

      <form action={adminLogout}>
        <button type="submit" className="text-sm text-ink/60 underline underline-offset-2">
          Quitter l&apos;espace administrateur
        </button>
      </form>
    </main>
  );
}

import { notFound, redirect } from "next/navigation";
import BackLink from "@/components/BackLink";
import { familyInk } from "@/components/theme";
import { categoryLabels, getCompetence } from "@/data/competences";
import { getResults, isAdmin } from "@/lib/votes";

export const dynamic = "force-dynamic";

export default async function AdminCompetencePage({
  params,
}: {
  params: Promise<{ competenceId: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { competenceId } = await params;
  const competence = getCompetence(competenceId);
  if (!competence) notFound();

  const results = await getResults(competence.subCompetencies.map((s) => s.id));
  const ink = familyInk[competence.category];

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 px-4 py-4">
      <div>
        <BackLink href="/admin" label="Résultats" />
        <p className="mt-3 text-sm font-semibold" style={{ color: ink }}>
          {categoryLabels[competence.category]}
        </p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">{competence.title}</h1>
      </div>

      {competence.subCompetencies.map((sub) => {
        const result = results.get(sub.id);
        return (
          <section key={sub.id} className="rounded-2xl bg-white p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold">{sub.title}</h2>
              <span className="shrink-0 text-sm text-ink/60">
                {result?.voteCount ?? 0} vote{(result?.voteCount ?? 0) > 1 ? "s" : ""}
              </span>
            </div>

            {!result || result.ranking.length === 0 ? (
              <p className="mt-2 text-base text-ink/60">Aucun vote pour l&apos;instant.</p>
            ) : (
              <ol className="mt-3 flex flex-col gap-1.5">
                {result.ranking.map((row, i) => (
                  <li key={`${row.player}-${i}`} className="flex items-baseline gap-3">
                    <span className="w-6 shrink-0 text-sm font-semibold" style={{ color: ink }}>
                      {row.rank}
                    </span>
                    <span className="flex-1 text-base">{row.player}</span>
                    <span className="shrink-0 text-base font-semibold">{row.points} pts</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </main>
  );
}

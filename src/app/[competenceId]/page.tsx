import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BackLink from "@/components/BackLink";
import { familyInk, getShade } from "@/components/theme";
import { categoryLabels, competences, getCompetence } from "@/data/competences";
import { getCurrentPlayer, getVotedSubIds } from "@/lib/votes";

export const dynamicParams = false;

export function generateStaticParams() {
  return competences.map((c) => ({ competenceId: c.id }));
}

export default async function CompetencePage({
  params,
}: {
  params: Promise<{ competenceId: string }>;
}) {
  const { competenceId } = await params;
  const competence = getCompetence(competenceId);
  if (!competence) notFound();

  const voter = await getCurrentPlayer();
  if (!voter) redirect("/joueur");
  const votedSubIds = await getVotedSubIds(voter.id);

  const shade = getShade(competence);
  const subs = competence.subCompetencies;
  // Légère variation de luminosité d'un bloc à l'autre (au plus 10 % plus sombre).
  const step = subs.length > 1 ? 10 / (subs.length - 1) : 0;

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-2 pt-3 pb-2">
      <div className="px-2">
        <BackLink href="/" label="Retour" />
        <p className="mt-3 text-sm font-semibold" style={{ color: familyInk[competence.category] }}>
          {categoryLabels[competence.category]}
        </p>
        <h1 className="mt-0.5 mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
          {competence.title}
        </h1>
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {subs.map((sub, i) => (
          <li key={sub.id} className="flex min-h-20 flex-1">
            <Link
              href={`/${competence.id}/${sub.id}`}
              style={{
                backgroundColor: `color-mix(in oklab, ${shade.bg} ${100 - i * step}%, black)`,
                color: shade.fg,
              }}
              className="flex flex-1 items-center justify-between gap-4 rounded-2xl px-5 py-4 text-xl leading-snug font-semibold transition-transform duration-100 active:scale-[0.98] active:brightness-95"
            >
              <span className="flex flex-col">
                {sub.title}
                {votedSubIds.has(sub.id) && (
                  <span className="text-sm font-medium opacity-80">✓ Déjà évaluée</span>
                )}
              </span>
              <span aria-hidden="true" className="text-3xl opacity-60">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

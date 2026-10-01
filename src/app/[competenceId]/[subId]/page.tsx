import { notFound, redirect } from "next/navigation";
import BackLink from "@/components/BackLink";
import VoteForm from "@/components/VoteForm";
import { familyInk, getShade } from "@/components/theme";
import { competences, getCompetence } from "@/data/competences";
import { playerName } from "@/lib/supabase";
import { getCurrentPlayer, getPlayers, getVotedSubIds } from "@/lib/votes";

export const dynamicParams = false;

export function generateStaticParams() {
  return competences.flatMap((c) =>
    c.subCompetencies.map((s) => ({ competenceId: c.id, subId: s.id })),
  );
}

export default async function SubCompetencePage({
  params,
}: {
  params: Promise<{ competenceId: string; subId: string }>;
}) {
  const { competenceId, subId } = await params;
  const competence = getCompetence(competenceId);
  const sub = competence?.subCompetencies.find((s) => s.id === subId);
  if (!competence || !sub) notFound();

  const voter = await getCurrentPlayer();
  if (!voter) redirect("/joueur");

  const [players, votedSubIds] = await Promise.all([getPlayers(), getVotedSubIds(voter.id)]);
  const dejaVote = votedSubIds.has(sub.id);
  // Le joueur ne peut pas se choisir lui-même : il n'apparaît pas dans les menus.
  const autres = players
    .filter((p) => p.id !== voter.id)
    .map((p) => ({ id: p.id, name: playerName(p) }));

  const shade = getShade(competence);
  const ink = familyInk[competence.category];

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-2 pt-3 pb-4">
      <div className="px-2">
        <BackLink href={`/${competence.id}`} label={competence.title} />
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{sub.title}</h1>
      </div>

      {sub.behaviors.length > 0 && (
        <>
          <h2 className="mt-1 mb-3 px-2 text-sm font-semibold" style={{ color: ink }}>
            Comportements observables
          </h2>
          {/* Blocs en version adoucie de la teinte de la compétence, bordés d une version plus soutenue. */}
          <ul className="flex flex-col gap-2">
            {sub.behaviors.map((b, i) => (
              <li
                key={i}
                style={{
                  backgroundColor: `color-mix(in oklab, ${shade.bg} 55%, white)`,
                  borderColor: `color-mix(in oklab, ${shade.bg} 55%, ${ink})`,
                  color: ink,
                }}
                className="flex min-h-20 items-center rounded-2xl border-l-8 px-5 py-4 text-lg leading-relaxed font-medium"
              >
                {b}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-4 px-2">
        {dejaVote ? (
          <p
            style={{ backgroundColor: `color-mix(in oklab, ${shade.bg} 55%, white)`, color: ink }}
            className="rounded-2xl px-5 py-4 text-lg font-medium"
          >
            ✓ Tu as déjà réalisé cette évaluation.
          </p>
        ) : autres.length < 3 ? (
          <p className="rounded-2xl bg-white px-5 py-4 text-base text-ink/70">
            Il faut au moins 3 autres joueurs dans l&apos;effectif pour pouvoir voter.
          </p>
        ) : (
          <>
            <h2 className="mb-3 text-base font-semibold" style={{ color: ink }}>
              Selon toi, quels sont les joueurs de ton équipe les plus performants pour cette
              sous-compétence ?
            </h2>
            <VoteForm
              competenceId={competence.id}
              subId={sub.id}
              players={autres}
              accent={ink}
              accentText="#ffffff"
            />
          </>
        )}
      </div>
    </main>
  );
}

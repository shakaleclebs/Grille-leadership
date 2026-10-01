import Link from "next/link";
import { redirect } from "next/navigation";
import { categoryLabels, competences, referentielTitle, type Category } from "@/data/competences";
import { familyInk, getShade } from "@/components/theme";
import { playerName } from "@/lib/supabase";
import { getCurrentPlayer } from "@/lib/votes";

export default async function Home() {
  const columns: Category[] = ["tache", "motivation"];
  const voter = await getCurrentPlayer();
  if (!voter) redirect("/joueur");

  return (
    <main className="home-screen mx-auto flex min-h-[34rem] max-w-3xl flex-col px-2 pb-2">
      <div className="flex items-baseline justify-between gap-3 px-2 pt-5 pb-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{referentielTitle}</h1>
        <Link href="/joueur" className="shrink-0 text-sm text-ink/60 underline underline-offset-2">
          {playerName(voter)}
        </Link>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
        {columns.map((category) => (
          <section key={category} className="flex min-h-0 flex-col gap-2">
            <h2 className="px-2 text-sm font-semibold" style={{ color: familyInk[category] }}>
              {categoryLabels[category]}
            </h2>
            {competences
              .filter((c) => c.category === category)
              .map((c) => {
                const shade = getShade(c);
                return (
                  <Link
                    key={c.id}
                    href={`/${c.id}`}
                    style={{ backgroundColor: shade.bg, color: shade.fg }}
                    className="flex min-h-24 flex-1 items-end rounded-2xl p-4 text-lg leading-snug font-semibold transition-transform duration-100 active:scale-[0.97] active:brightness-95 sm:text-xl"
                  >
                    {c.title}
                  </Link>
                );
              })}
          </section>
        ))}
      </div>
    </main>
  );
}

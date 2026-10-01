"use client";

import { useActionState, useState } from "react";
import { submitVote, type FormState } from "@/lib/actions";

type Option = { id: string; name: string };

const positions = [
  { field: "rank1", label: "Top 1" },
  { field: "rank2", label: "Top 2" },
  { field: "rank3", label: "Top 3" },
] as const;

export default function VoteForm({
  competenceId,
  subId,
  players,
  accent,
  accentText,
}: {
  competenceId: string;
  subId: string;
  players: Option[];
  accent: string;
  accentText: string;
}) {
  const [choix, setChoix] = useState<Record<string, string>>({});
  const [state, formAction, pending] = useActionState<FormState, FormData>(submitVote, {});

  const selection = positions.map((p) => choix[p.field] ?? "");
  const complet = selection.every(Boolean) && new Set(selection).size === 3;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="competenceId" value={competenceId} />
      <input type="hidden" name="subId" value={subId} />

      {positions.map(({ field, label }) => (
        <label key={field} className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold" style={{ color: accent }}>
            {label}
          </span>
          <select
            name={field}
            value={choix[field] ?? ""}
            onChange={(e) => setChoix((c) => ({ ...c, [field]: e.target.value }))}
            className="min-h-14 rounded-xl border-2 bg-white px-3 text-lg"
            style={{ borderColor: accent }}
          >
            <option value="">Sélectionner un joueur</option>
            {players.map((p) => (
              <option
                key={p.id}
                value={p.id}
                // Un joueur déjà placé ne peut pas être repris ailleurs.
                disabled={selection.includes(p.id) && choix[field] !== p.id}
              >
                {p.name}
              </option>
            ))}
          </select>
        </label>
      ))}

      {state.error && (
        <p role="alert" className="text-base font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={!complet || pending}
        style={complet && !pending ? { backgroundColor: accent, color: accentText } : undefined}
        className="min-h-14 rounded-xl text-lg font-semibold transition-colors disabled:bg-ink/10 disabled:text-ink/40"
      >
        {pending ? "Enregistrement…" : "Valider mon classement"}
      </button>
    </form>
  );
}

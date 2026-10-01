"use client";

import { useActionState } from "react";
import { selectVoter, type FormState } from "@/lib/actions";

export default function PlayerPicker({
  players,
}: {
  players: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(selectVoter, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <select
        name="playerId"
        defaultValue=""
        className="min-h-14 rounded-xl border-2 border-ink/20 bg-white px-3 text-lg"
      >
        <option value="">Sélectionner mon nom</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {state.error && (
        <p role="alert" className="text-base font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-14 rounded-xl bg-ink text-lg font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Un instant…" : "Commencer"}
      </button>
    </form>
  );
}

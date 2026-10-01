"use client";

import { useActionState } from "react";
import { addPlayer, deletePlayer, updatePlayer, type FormState } from "@/lib/actions";

type Player = { id: string; first_name: string; last_name: string };

function AddForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(addPlayer, {});

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl bg-white p-4">
      <div className="flex flex-wrap gap-2">
        <input
          name="firstName"
          placeholder="Prénom"
          className="min-h-12 flex-1 rounded-lg border-2 border-ink/20 px-3 text-base"
        />
        <input
          name="lastName"
          placeholder="Nom"
          className="min-h-12 flex-1 rounded-lg border-2 border-ink/20 px-3 text-base"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 rounded-lg bg-ink px-4 font-semibold text-white disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}

function PlayerRow({ player }: { player: Player }) {
  const [updateState, updateAction, updating] = useActionState<FormState, FormData>(
    updatePlayer,
    {},
  );
  const [deleteState, deleteAction, deleting] = useActionState<FormState, FormData>(
    deletePlayer,
    {},
  );
  const erreur = updateState.error ?? deleteState.error;

  return (
    <li className="flex flex-col gap-2 rounded-xl bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <form action={updateAction} className="flex flex-1 flex-wrap gap-2">
          <input type="hidden" name="playerId" value={player.id} />
          <input
            name="firstName"
            defaultValue={player.first_name}
            className="min-h-11 flex-1 rounded-lg border-2 border-ink/15 px-3 text-base"
          />
          <input
            name="lastName"
            defaultValue={player.last_name}
            className="min-h-11 flex-1 rounded-lg border-2 border-ink/15 px-3 text-base"
          />
          <button
            type="submit"
            disabled={updating}
            className="min-h-11 rounded-lg border-2 border-ink/20 px-3 font-medium disabled:opacity-50"
          >
            Enregistrer
          </button>
        </form>
        <form action={deleteAction}>
          <input type="hidden" name="playerId" value={player.id} />
          <button
            type="submit"
            disabled={deleting}
            className="min-h-11 rounded-lg px-3 font-medium text-red-700 disabled:opacity-50"
          >
            Supprimer
          </button>
        </form>
      </div>
      {erreur && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {erreur}
        </p>
      )}
    </li>
  );
}

export default function PlayerAdmin({ players }: { players: Player[] }) {
  return (
    <div className="flex flex-col gap-3">
      <AddForm />
      {players.length === 0 ? (
        <p className="text-base text-ink/70">Aucun joueur pour l&apos;instant.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {players.map((p) => (
            <PlayerRow key={p.id} player={p} />
          ))}
        </ul>
      )}
      <p className="text-sm text-ink/60">
        Supprimer un joueur efface aussi ses votes et les votes reçus le concernant.
      </p>
    </div>
  );
}

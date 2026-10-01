"use client";

import { useActionState } from "react";
import { adminLogin, type FormState } from "@/lib/actions";

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(adminLogin, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold">Code administrateur</span>
        <input
          type="password"
          name="code"
          autoComplete="current-password"
          className="min-h-14 rounded-xl border-2 border-ink/20 bg-white px-3 text-lg"
        />
      </label>

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
        {pending ? "Vérification…" : "Accéder aux résultats"}
      </button>
    </form>
  );
}

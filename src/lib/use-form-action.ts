"use client";

import { useState, type FormEvent } from "react";

export type ActionState = { error?: string; success?: boolean };

/**
 * Small, React-version-agnostic helper for server-action forms:
 * shows a pending state, surfaces validation errors inline, and resets the
 * form after a successful submit.
 */
export function useFormAction(action: (formData: FormData) => Promise<ActionState>) {
  const [state, setState] = useState<ActionState>({});
  const [isPending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setState({});
    setPending(true);
    try {
      const result = await action(formData);
      setState(result);
      if (result.success) form.reset();
    } catch {
      setState({ error: "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return { state, isPending, onSubmit };
}

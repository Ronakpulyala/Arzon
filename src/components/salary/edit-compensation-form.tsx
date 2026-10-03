"use client";

import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { updateCompensation } from "@/app/(dashboard)/salary/actions";
import { useFormAction } from "@/lib/use-form-action";
import { formatCurrency } from "@/lib/salary";

export function EditCompensationForm({
  userId,
  baseSalary,
  commissionRate
}: {
  userId: string;
  baseSalary: number;
  commissionRate: number;
}) {
  const [editing, setEditing] = useState(false);
  const { state, isPending, onSubmit } = useFormAction(updateCompensation);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group flex items-center gap-1.5 text-left text-xs text-ink-700 hover:text-navy-900"
      >
        <span>
          {formatCurrency(baseSalary)} base
          <span className="text-ink-500"> · {Math.round(commissionRate * 100)}% commission</span>
        </span>
        <Pencil size={11} className="text-ink-300 group-hover:text-ink-500" />
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        await onSubmit(e);
        setEditing(false);
      }}
      className="flex items-center gap-1.5"
    >
      <input type="hidden" name="userId" value={userId} />
      <input
        name="baseSalary"
        type="number"
        min="0"
        step="500"
        defaultValue={baseSalary}
        className="w-24 rounded-md border border-ink-100 bg-white px-2 py-1 text-xs outline-none focus-visible:border-amber-500"
      />
      <input
        name="commissionPct"
        type="number"
        min="0"
        max="100"
        step="0.5"
        defaultValue={Math.round(commissionRate * 1000) / 10}
        className="w-16 rounded-md border border-ink-100 bg-white px-2 py-1 text-xs outline-none focus-visible:border-amber-500"
      />
      <span className="text-[11px] text-ink-500">%</span>
      <button
        type="submit"
        disabled={isPending}
        aria-label="Save"
        className="flex h-6 w-6 items-center justify-center rounded-md bg-success/10 text-success hover:bg-success/20 disabled:opacity-50"
      >
        <Check size={12} />
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        aria-label="Cancel"
        className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-100 text-ink-500 hover:bg-ink-100/80"
      >
        <X size={12} />
      </button>
      {state.error && <span className="ml-1 text-[11px] text-danger">{state.error}</span>}
    </form>
  );
}

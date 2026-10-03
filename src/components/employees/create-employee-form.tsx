"use client";

import { useState } from "react";
import { CheckCircle2, UserPlus } from "lucide-react";
import { createEmployee } from "@/app/(dashboard)/employees/actions";
import { useFormAction } from "@/lib/use-form-action";

const field =
  "mt-1.5 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus-visible:border-amber-500";

export function CreateEmployeeForm() {
  const { state, isPending, onSubmit } = useFormAction(createEmployee);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800"
      >
        <UserPlus size={16} strokeWidth={1.8} />
        Add employee
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-ink-100 bg-surface-card p-5 shadow-subtle">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-ink-900">Add employee</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-500 hover:text-ink-900">
          Cancel
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-ink-700">Full name</label>
          <input id="name" name="name" required className={field} placeholder="e.g. Sana Khan" />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-ink-700">Work email</label>
          <input id="email" name="email" type="email" required className={field} placeholder="sana.khan@arzonglobal.com" />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-ink-700">Temporary password</label>
          <input id="password" name="password" type="text" required minLength={8} className={field} placeholder="At least 8 characters" />
        </div>
        <div>
          <label htmlFor="role" className="block text-xs font-medium text-ink-700">Role</label>
          <select id="role" name="role" required defaultValue="EMPLOYEE" className={field}>
            <option value="EMPLOYEE">Employee</option>
            <option value="HR">HR</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="department" className="block text-xs font-medium text-ink-700">Department</label>
          <input id="department" name="department" className={field} placeholder="e.g. Sales" />
        </div>
        <div>
          <label htmlFor="designation" className="block text-xs font-medium text-ink-700">Designation</label>
          <input id="designation" name="designation" className={field} placeholder="e.g. Sales Executive" />
        </div>
        <div>
          <label htmlFor="baseSalary" className="block text-xs font-medium text-ink-700">Base salary (₹/month)</label>
          <input id="baseSalary" name="baseSalary" type="number" min="0" step="500" defaultValue={0} className={field} />
        </div>
        <div>
          <label htmlFor="commissionPct" className="block text-xs font-medium text-ink-700">Commission on sales (%)</label>
          <input id="commissionPct" name="commissionPct" type="number" min="0" max="100" step="0.5" defaultValue={0} className={field} />
        </div>
      </div>

      {state.error && <p role="alert" className="mt-3 text-xs text-danger">{state.error}</p>}
      {state.success && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-success">
          <CheckCircle2 size={13} strokeWidth={2} />
          Employee added — share the temporary password with them securely.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 flex items-center justify-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
      >
        <UserPlus size={16} strokeWidth={1.8} />
        {isPending ? "Creating..." : "Create employee"}
      </button>
    </form>
  );
}

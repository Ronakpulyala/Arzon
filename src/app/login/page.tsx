"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setLoading(false);

    if (res?.error) {
      setError("That email or password doesn't match our records.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-500">
            <GraduationCap className="text-navy-900" size={20} />
          </div>
          <h1 className="mt-3 font-display text-lg font-semibold text-ink-900">
            Arzon Global
          </h1>
          <p className="text-xs text-ink-500">Sign in to the admin console</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-ink-100 bg-surface-card p-6"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-ink-700">
                Work email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus-visible:border-amber-500"
                placeholder="you@arzonglobal.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-ink-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-ink-100 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus-visible:border-amber-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-xs text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-navy-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-ink-500">
          Forgot your password? Contact HR to reset it.
        </p>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) {
      setError("Those details don't match. Try again.");
      return;
    }
    router.push(params.get("callbackUrl") ?? "/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <p className="eyebrow text-saffron-bright">Akhals Spice &amp; More</p>
      <h1 className="font-display mt-3 text-3xl text-cream">Kitchen door</h1>
      <p className="mt-2 text-sm text-cream/60">Sign in to manage recipes and analytics.</p>

      <label className="mt-8 block">
        <span className="eyebrow text-cream/50">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-sm border border-cream/20 bg-charcoal-soft px-4 py-3 text-cream focus:border-saffron-bright"
        />
      </label>
      <label className="mt-5 block">
        <span className="eyebrow text-cream/50">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-sm border border-cream/20 bg-charcoal-soft px-4 py-3 text-cream focus:border-saffron-bright"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 border-l-2 border-spice pl-3 text-sm text-cream/80">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="eyebrow mt-8 w-full bg-saffron-bright py-4 text-charcoal transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-charcoal px-5">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}

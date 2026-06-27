"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { saveSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      saveSession(res.data.token, res.data.user);

      router.push(res.data.user.role === "staff" ? "/staff" : "/order");
    } catch (err) {
      const message = err instanceof Error && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-display font-extrabold text-xl text-ink mb-10 inline-block"
        >
          Med<span className="text-amber">Q</span>
        </Link>

        <div className="token-slip bg-surface border border-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          <p className="font-mono text-xs text-ink-faint uppercase tracking-widest mb-2 mt-2">
            Welcome back
          </p>
          <h1 className="font-display font-bold text-2xl text-ink mb-6">
            Log in to MedQ
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-ink placeholder:text-ink-faint focus:border-amber outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-ink placeholder:text-ink-faint focus:border-amber outline-none transition-colors"
                placeholder="Your password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3.5 rounded-full bg-amber hover:bg-amber-glow text-background transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            New to MedQ?{" "}
            <Link href="/signup" className="text-amber hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

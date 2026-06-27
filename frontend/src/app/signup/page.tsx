"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { saveSession } from "@/lib/api";

interface Branch {
  id: number;
  name: string;
  city: string;
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "message" in err.response.data &&
    typeof err.response.data.message === "string"
  ) {
    return err.response.data.message;
  }
  return fallback;
}

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"customer" | "staff">("customer");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    branchId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/branches").then((res) => setBranches(res.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      };
      if (role === "staff") {
        payload.branchId = Number(form.branchId);
      }

      const res = await api.post("/auth/signup", payload);
      saveSession(res.data.token, res.data.user);

      router.push(role === "staff" ? "/staff" : "/order");
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong. Try again."));
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
            New here
          </p>
          <h1 className="font-display font-bold text-2xl text-ink mb-6">
            Create your account
          </h1>

          {/* Role toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-background rounded-full border border-border">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
                role === "customer"
                  ? "bg-amber text-background"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              I&apos;m a customer
            </button>
            <button
              type="button"
              onClick={() => setRole("staff")}
              className={`flex-1 text-sm font-medium py-2 rounded-full transition-colors ${
                role === "staff"
                  ? "bg-emerald text-background"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              I&apos;m pharmacy staff
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">
                Full name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-ink placeholder:text-ink-faint focus:border-amber outline-none transition-colors"
                placeholder="Your name"
              />
            </div>

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
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-ink placeholder:text-ink-faint focus:border-amber outline-none transition-colors"
                placeholder="At least 6 characters"
              />
            </div>

            {role === "staff" && (
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">
                  Your branch
                </label>
                <select
                  required
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-ink focus:border-emerald outline-none transition-colors"
                >
                  <option value="" disabled>
                    Select your branch
                  </option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3.5 rounded-full transition-colors mt-2 ${
                role === "staff"
                  ? "bg-emerald hover:bg-emerald-glow"
                  : "bg-amber hover:bg-amber-glow"
              } text-background disabled:opacity-60`}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-amber hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

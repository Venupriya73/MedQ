import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <span className="font-display font-extrabold text-xl tracking-tight text-ink">
          Med<span className="text-amber">Q</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-ink-muted hover:text-ink transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-amber text-background px-5 py-2.5 rounded-full hover:bg-amber-glow transition-colors"
          >
            Get your token
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center px-6 md:px-12 py-12 md:py-0">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-emerald-glow mb-6">
              வரிசை குறைவு, சேவை விரைவு · shorter queues, faster service
            </p>
            <h1 className="font-display font-extrabold text-5xl md:text-6xl leading-[1.05] text-ink mb-6">
              Skip the line,
              <br />
              not the care.
            </h1>
            <p className="text-ink-muted text-lg leading-relaxed mb-10 max-w-md">
              Order ahead from your local pharmacy. We prep it while you walk
              over — pick up at the counter, no waiting required.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/signup"
                className="bg-amber text-background font-semibold px-7 py-3.5 rounded-full hover:bg-amber-glow transition-colors"
              >
                Place your first order
              </Link>
              <Link
                href="/login?role=staff"
                className="text-ink-muted hover:text-ink font-medium text-sm transition-colors"
              >
                I'm pharmacy staff →
              </Link>
            </div>
          </div>

          {/* Right: signature token-slip element */}
          <div className="flex justify-center md:justify-end">
            <div className="token-slip bg-surface border border-border rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs text-ink-faint uppercase tracking-wider">
                  Medplus · Anna Nagar
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-glow">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow animate-pulse" />
                  Ready
                </span>
              </div>

              <div className="text-center py-8">
                <p className="font-mono text-xs text-ink-faint uppercase tracking-widest mb-2">
                  Your token
                </p>
                <p className="font-mono font-bold text-7xl text-amber-glow tabular-nums">
                  014
                </p>
              </div>

              <div className="border-t border-border pt-5 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-faint">Paracetamol 500mg ×2</span>
                  <span className="text-ink-muted font-mono">₹50.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-faint">Dolo 650</span>
                  <span className="text-ink-muted font-mono">₹30.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

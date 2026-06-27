"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api, { clearSession } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

interface Order {
  id: number;
  token_number: number;
  status: "placed" | "preparing" | "ready" | "picked_up";
  branch_name: string;
  created_at: string;
}

const STATUS_LABEL: Record<Order["status"], string> = {
  placed: "Placed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  picked_up: "Picked up",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  placed: "text-amber-glow",
  preparing: "text-amber-glow",
  ready: "text-emerald-glow",
  picked_up: "text-ink-faint",
};

const STATUS_STEPS: Order["status"][] = ["placed", "preparing", "ready", "picked_up"];

export default function MyOrdersPage() {
  const { user, checked } = useAuthGuard("customer");
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadOrders = useCallback(() => {
    api.get("/orders/my").then((res) => setOrders(res.data));
  }, []);

  useEffect(() => {
    if (checked) loadOrders();
  }, [checked, loadOrders]);

  // Poll while there's an active (non-picked-up) order, so status updates show live
  useEffect(() => {
    if (!checked) return;
    const hasActive = orders.some((o) => o.status !== "picked_up");
    if (!hasActive) return;
    const interval = setInterval(loadOrders, 6000);
    return () => clearInterval(interval);
  }, [checked, orders, loadOrders]);

  if (!checked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-ink-faint font-mono text-sm">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <Link href="/" className="font-display font-extrabold text-xl text-ink">
          Med<span className="text-amber">Q</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-muted">{user?.name}</span>
          <button
            onClick={() => {
              clearSession();
              window.location.href = "/";
            }}
            className="text-sm text-ink-faint hover:text-ink transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink mb-1">
            Your orders
          </h1>
          <p className="text-ink-muted">Track status, see what&apos;s ready.</p>
        </div>
        <Link
          href="/order"
          className="text-sm font-semibold bg-amber text-background px-5 py-2.5 rounded-full hover:bg-amber-glow transition-colors whitespace-nowrap"
        >
          New order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <p className="text-ink-muted mb-4">No orders yet.</p>
          <Link href="/order" className="text-amber hover:underline text-sm font-medium">
            Place your first order →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const stepIndex = STATUS_STEPS.indexOf(order.status);

            return (
              <div
                key={order.id}
                className="token-slip bg-surface border border-border rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="font-mono font-bold text-2xl text-amber-glow tabular-nums w-14 text-center">
                      {String(order.token_number).padStart(3, "0")}
                    </div>
                    <div>
                      <p className="text-ink font-medium">{order.branch_name}</p>
                      <p className={`text-xs font-medium ${STATUS_COLOR[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </p>
                    </div>
                  </div>
                  <span className="text-ink-faint text-sm">
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    {/* Progress steps */}
                    <div className="flex items-center justify-between mb-2">
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} className="flex-1 flex items-center">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              i <= stepIndex
                                ? step === "ready" || step === "picked_up"
                                  ? "bg-emerald-glow"
                                  : "bg-amber-glow"
                                : "bg-border"
                            }`}
                          />
                          {i < STATUS_STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-px ${
                                i < stepIndex ? "bg-amber-glow" : "bg-border"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-ink-faint font-mono">
                      <span>Placed</span>
                      <span>Preparing</span>
                      <span>Ready</span>
                      <span>Picked up</span>
                    </div>

                    {order.status === "ready" && (
                      <p className="text-sm text-emerald-glow bg-emerald/10 border border-emerald/20 rounded-lg px-3 py-2 mt-4">
                        Your order is ready! Show token {String(order.token_number).padStart(3, "0")} at the counter.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

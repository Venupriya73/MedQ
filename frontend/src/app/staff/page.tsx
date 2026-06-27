"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api, { clearSession } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

interface Order {
  id: number;
  token_number: number;
  status: "placed" | "preparing" | "ready" | "picked_up";
  customer_name: string;
  prescription_image_url: string | null;
  created_at: string;
}

const STATUS_FLOW: Order["status"][] = ["placed", "preparing", "ready", "picked_up"];

const STATUS_LABEL: Record<Order["status"], string> = {
  placed: "Placed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  picked_up: "Picked up",
};

const STATUS_NEXT_LABEL: Record<Order["status"], string> = {
  placed: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark picked up",
  picked_up: "",
};

const STATUS_COLOR: Record<Order["status"], string> = {
  placed: "text-amber-glow",
  preparing: "text-amber-glow",
  ready: "text-emerald-glow",
  picked_up: "text-ink-faint",
};

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api$/, "");

export default function StaffDashboard() {
  const { user, checked } = useAuthGuard("staff");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const [loadError, setLoadError] = useState("");

  const loadOrders = useCallback(() => {
    if (!user?.branch_id) return;
    api
      .get(`/orders/branch/${user.branch_id}`)
      .then((res) => {
        setOrders(res.data);
        setLoadError("");
      })
      .catch(() => setLoadError("Couldn't refresh the queue. Check your connection."));
  }, [user]);

  useEffect(() => {
    if (checked) loadOrders();
  }, [checked, loadOrders]);

  useEffect(() => {
    if (!checked) return;
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, [checked, loadOrders]);

  async function advanceStatus(order: Order) {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    if (!nextStatus) return;

    setUpdatingId(order.id);
    try {
      await api.patch(`/orders/${order.id}/status`, { status: nextStatus });
      loadOrders();
    } catch {
      setLoadError("Couldn't update that order. Try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!checked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-ink-faint font-mono text-sm">Loading...</p>
      </main>
    );
  }

  const visibleOrders =
    filter === "active"
      ? orders.filter((o) => o.status !== "picked_up")
      : orders;

  const counts = {
    placed: orders.filter((o) => o.status === "placed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  return (
    <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto">
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

      <h1 className="font-display font-bold text-3xl text-ink mb-1">
        Order queue
      </h1>
      <p className="text-ink-muted mb-6">Live orders for your branch.</p>

      {loadError && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-6">
          {loadError}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <p className="text-2xl font-mono font-bold text-amber-glow">{counts.placed}</p>
          <p className="text-xs text-ink-faint mt-1">New orders</p>
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <p className="text-2xl font-mono font-bold text-amber-glow">{counts.preparing}</p>
          <p className="text-xs text-ink-faint mt-1">Preparing</p>
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <p className="text-2xl font-mono font-bold text-emerald-glow">{counts.ready}</p>
          <p className="text-xs text-ink-faint mt-1">Ready for pickup</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("active")}
          className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
            filter === "active"
              ? "bg-amber text-background border-amber"
              : "bg-surface text-ink-muted border-border"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
            filter === "all"
              ? "bg-amber text-background border-amber"
              : "bg-surface text-ink-muted border-border"
          }`}
        >
          All
        </button>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center">
          <p className="text-ink-muted">No orders right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => (
            <div
              key={order.id}
              className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-5">
                <div className="font-mono font-bold text-2xl text-amber-glow tabular-nums w-14 text-center">
                  {String(order.token_number).padStart(3, "0")}
                </div>
                <div>
                  <p className="text-ink font-medium">{order.customer_name}</p>
                  <div className="flex items-center gap-3">
                    <p className={`text-xs font-medium ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </p>
                    {order.prescription_image_url && (
                      <button
                        onClick={() =>
                          setViewingImage(`${API_ORIGIN}${order.prescription_image_url}`)
                        }
                        className="flex items-center gap-1 text-xs font-medium text-emerald-glow hover:underline"
                      >
                        📋 View prescription
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {order.status !== "picked_up" && (
                <button
                  onClick={() => advanceStatus(order)}
                  disabled={updatingId === order.id}
                  className={`text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors disabled:opacity-50 ${
                    order.status === "preparing"
                      ? "bg-emerald hover:bg-emerald-glow text-background"
                      : "bg-amber hover:bg-amber-glow text-background"
                  }`}
                >
                  {updatingId === order.id ? "..." : STATUS_NEXT_LABEL[order.status]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Prescription image modal */}
      {viewingImage && (
        <div
          onClick={() => setViewingImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
        >
          <div className="max-w-lg w-full">
            <img
              src={viewingImage}
              alt="Prescription"
              className="w-full rounded-2xl border border-border"
            />
            <button
              onClick={() => setViewingImage(null)}
              className="w-full mt-4 text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

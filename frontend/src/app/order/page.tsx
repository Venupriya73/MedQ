"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api, { clearSession } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";

interface Branch {
  id: number;
  name: string;
  city: string;
}

interface Medicine {
  id: number;
  name: string;
  price: string;
  stock_qty: number;
}

interface CartLine {
  medicineId: number;
  name: string;
  price: number;
  quantity: number;
}

interface PlacedOrder {
  id: number;
  token_number: number;
  status: string;
}

export default function OrderPage() {
  const { user, checked } = useAuthGuard("customer");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/branches").then((res) => {
      setBranches(res.data);
      setBranchesLoading(false);
    }).catch(() => setBranchesLoading(false));
  }, []);

  useEffect(() => {
    if (!branchId) return;
    setCart([]);
    setMedicinesLoading(true);
    api
      .get(`/medicines?branchId=${branchId}`)
      .then((res) => setMedicines(res.data))
      .finally(() => setMedicinesLoading(false));
  }, [branchId]);

  function addToCart(med: Medicine) {
    setCart((prev) => {
      const existing = prev.find((c) => c.medicineId === med.id);
      if (existing) {
        return prev.map((c) =>
          c.medicineId === med.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        { medicineId: med.id, name: med.name, price: Number(med.price), quantity: 1 },
      ];
    });
  }

  function changeQty(medicineId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((c) =>
          c.medicineId === medicineId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError("");
    setPrescriptionFile(file);
    setPrescriptionPreview(URL.createObjectURL(file));
  }

  function removePrescription() {
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  async function placeOrder() {
    if (!branchId) return;
    if (cart.length === 0 && !prescriptionFile) return;

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("branchId", String(branchId));
      formData.append(
        "items",
        JSON.stringify(cart.map((c) => ({ medicineId: c.medicineId, quantity: c.quantity })))
      );
      if (prescriptionFile) {
        formData.append("prescriptionImage", prescriptionFile);
      }

      const res = await api.post("/orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPlacedOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not place order. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!checked) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-ink-faint font-mono text-sm">Loading...</p>
      </main>
    );
  }

  // --- Success state: show the token slip ---
  if (placedOrder) {
    const branch = branches.find((b) => b.id === branchId);
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="token-slip bg-surface border border-border rounded-2xl p-8 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-xs text-ink-faint uppercase tracking-wider">
                {branch?.name}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-glow">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-glow animate-pulse" />
                Placed
              </span>
            </div>

            <div className="text-center py-8">
              <p className="font-mono text-xs text-ink-faint uppercase tracking-widest mb-2">
                Your token
              </p>
              <p className="font-mono font-bold text-7xl text-amber-glow tabular-nums">
                {String(placedOrder.token_number).padStart(3, "0")}
              </p>
            </div>

            <div className="border-t border-border pt-5 space-y-2.5 mb-6">
              {cart.map((c) => (
                <div key={c.medicineId} className="flex justify-between text-sm">
                  <span className="text-ink-faint">
                    {c.name} ×{c.quantity}
                  </span>
                  <span className="text-ink-muted font-mono">
                    ₹{(c.price * c.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {cart.length > 0 && (
                <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
                  <span className="text-ink">Total</span>
                  <span className="text-ink font-mono">₹{total.toFixed(2)}</span>
                </div>
              )}
              {prescriptionFile && (
                <div className="flex items-center gap-2 text-sm text-ink-faint pt-2">
                  <span>📋</span>
                  <span>Prescription attached</span>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-ink-faint">
              We'll prep your order. Walk in and show this token at the counter.
            </p>
          </div>

          <button
            onClick={() => {
              setPlacedOrder(null);
              setBranchId(null);
              removePrescription();
            }}
            className="w-full mt-4 text-sm text-ink-muted hover:text-ink transition-colors"
          >
            ← Place another order
          </button>
        </div>
      </main>
    );
  }

  // --- Main order-building state ---
  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <Link href="/" className="font-display font-extrabold text-xl text-ink">
          Med<span className="text-amber">Q</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-muted">Hi, {user?.name}</span>
          <Link href="/my-orders" className="text-sm text-ink-muted hover:text-ink transition-colors">
            My orders
          </Link>
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
        Order ahead
      </h1>
      <p className="text-ink-muted mb-8">
        Pick a branch, choose your medicines, skip the line.
      </p>

      {/* Branch selector */}
      <div className="mb-8">
        <label className="block text-xs font-medium text-ink-muted mb-2">
          Branch
        </label>
        <div className="flex flex-wrap gap-2">
          {branchesLoading && (
            <>
              <div className="h-10 w-32 bg-surface border border-border rounded-full animate-pulse" />
              <div className="h-10 w-28 bg-surface border border-border rounded-full animate-pulse" />
              <div className="h-10 w-36 bg-surface border border-border rounded-full animate-pulse" />
            </>
          )}
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => setBranchId(b.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                branchId === b.id
                  ? "bg-amber text-background border-amber"
                  : "bg-surface text-ink-muted border-border hover:border-amber-dim"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {branchId && (
        <>
          {/* Medicines list */}
          <div className="mb-8">
            <label className="block text-xs font-medium text-ink-muted mb-2">
              Medicines available
            </label>
            <div className="grid gap-2">
              {medicinesLoading && (
                <>
                  <div className="h-16 bg-surface border border-border rounded-xl animate-pulse" />
                  <div className="h-16 bg-surface border border-border rounded-xl animate-pulse" />
                  <div className="h-16 bg-surface border border-border rounded-xl animate-pulse" />
                </>
              )}
              {!medicinesLoading && medicines.map((med) => {
                const inCart = cart.find((c) => c.medicineId === med.id);
                return (
                  <div
                    key={med.id}
                    className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-ink font-medium">{med.name}</p>
                      <p className="text-ink-faint text-sm font-mono">
                        ₹{Number(med.price).toFixed(2)}
                      </p>
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => changeQty(med.id, -1)}
                          className="w-8 h-8 rounded-full bg-background border border-border text-ink hover:border-amber transition-colors"
                        >
                          −
                        </button>
                        <span className="font-mono text-ink w-4 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => changeQty(med.id, 1)}
                          className="w-8 h-8 rounded-full bg-background border border-border text-ink hover:border-amber transition-colors"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(med)}
                        className="text-sm font-medium text-amber hover:text-amber-glow transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider with "or" */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-faint uppercase tracking-wider">
              and / or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Prescription upload */}
          <div className="mb-8">
            <label className="block text-xs font-medium text-ink-muted mb-2">
              Attach a prescription photo
            </label>

            {!prescriptionPreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-border rounded-xl px-4 py-8 text-center hover:border-amber-dim transition-colors"
              >
                <p className="text-ink-muted text-sm mb-1">📋 Tap to upload a photo</p>
                <p className="text-ink-faint text-xs">JPG, PNG or WEBP, up to 5MB</p>
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-surface border border-border rounded-xl p-3">
                <img
                  src={prescriptionPreview}
                  alt="Prescription preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-ink text-sm font-medium">{prescriptionFile?.name}</p>
                  <p className="text-ink-faint text-xs">
                    {((prescriptionFile?.size || 0) / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={removePrescription}
                  className="text-sm text-ink-faint hover:text-ink transition-colors px-2"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            <p className="text-ink-faint text-xs mt-2">
              Our pharmacist will check your prescription and prepare it for pickup.
            </p>
          </div>
        </>
      )}

      {/* Cart summary + submit */}
      {(cart.length > 0 || prescriptionFile) && (
        <div className="sticky bottom-6 bg-surface border border-border rounded-2xl p-5 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between mb-4">
            <span className="text-ink-muted text-sm">
              {cart.length > 0
                ? `${cart.reduce((s, c) => s + c.quantity, 0)} items`
                : "Prescription order"}
            </span>
            {cart.length > 0 && (
              <span className="font-mono text-ink font-semibold">
                ₹{total.toFixed(2)}
              </span>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <button
            onClick={placeOrder}
            disabled={submitting}
            className="w-full bg-amber hover:bg-amber-glow text-background font-semibold py-3.5 rounded-full transition-colors disabled:opacity-60"
          >
            {submitting ? "Placing order..." : "Place order & get token"}
          </button>
        </div>
      )}
    </main>
  );
}

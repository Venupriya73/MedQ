"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, AuthUser } from "./api";

// Redirects to /login if not logged in, or if logged in with the wrong role.
// Pass requiredRole = null to just require "any logged in user".
export function useAuthGuard(requiredRole: "customer" | "staff" | null) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    if (requiredRole && session.role !== requiredRole) {
      router.replace(session.role === "staff" ? "/staff" : "/order");
      return;
    }

    setUser(session);
    setChecked(true);
  }, [requiredRole, router]);

  return { user, checked };
}
import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Attach the JWT token (if present) to every outgoing request automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get("medq_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// --- Auth helpers ---

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "customer" | "staff";
  branch_id: number | null;
}

export function saveSession(token: string, user: AuthUser) {
  Cookies.set("medq_token", token, { expires: 7 });
  Cookies.set("medq_user", JSON.stringify(user), { expires: 7 });
}

export function getSession(): AuthUser | null {
  const raw = Cookies.get("medq_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  Cookies.remove("medq_token");
  Cookies.remove("medq_user");
}
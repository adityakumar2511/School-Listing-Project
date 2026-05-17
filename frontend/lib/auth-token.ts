export const AUTH_TOKEN_KEY = "schoolsetu_token";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // seconds

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromStorage = window.localStorage.getItem(AUTH_TOKEN_KEY);
  if (fromStorage) return fromStorage;
  return readCookie(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

export type UserFromJwt = {
  id: string;
  role: string;
  email: string | null;
  name: string | null;
  phone: string | null;
};

/** Decode JWT payload (middle segment, base64url) — optional fields match API token shape. */
export function getUserFromToken(): UserFromJwt | null {
  const token = getAuthToken();
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const segment = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = segment.length % 4 === 0 ? "" : "=".repeat(4 - (segment.length % 4));
    const json = atob(segment + pad);
    const payload = JSON.parse(json) as Record<string, unknown>;
    const id = payload.id;
    const role = payload.role;
    if (typeof id !== "string" || typeof role !== "string") return null;
    return {
      id,
      role,
      email: typeof payload.email === "string" ? payload.email : null,
      name: typeof payload.name === "string" ? payload.name : null,
      phone: typeof payload.phone === "string" ? payload.phone : null,
    };
  } catch {
    return null;
  }
}

export function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

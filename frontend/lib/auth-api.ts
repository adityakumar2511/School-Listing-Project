/**
 * SchoolSetu backend auth endpoints live at `{NEXT_PUBLIC_API_URL}/api/auth/*`
 * (same paths as documented: /api/auth/login, /api/auth/send-otp, etc.).
 */
export function getAuthApiOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

export type AuthApiResult<T> = { ok: boolean; status: number; data: T };

export async function postAuthJson<T>(path: string, body: unknown): Promise<AuthApiResult<T>> {
  const res = await fetch(`${getAuthApiOrigin()}/api/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export function authErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
  return "Something went wrong. Please try again.";
}

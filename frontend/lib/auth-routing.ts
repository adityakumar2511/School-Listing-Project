/** Allows same-origin redirect after login (`?redirect=`). Rejects protocol-relative URLs. */
export function sanitizeRedirectParam(raw: string | null): string | null {
  if (!raw?.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

/** Navigate after receiving a JWT and optional role from the backend / NextAuth bridge. */
export function navigateAfterAuth(
  role: string | undefined,
  router: { replace: (href: string) => void },
  redirectParam?: string | null,
) {
  const redirect = sanitizeRedirectParam(redirectParam ?? null);
  if (redirect) {
    router.replace(redirect);
    return;
  }
  if (role === "admin") router.replace("/admin");
  else if (role === "school") router.replace("/school/dashboard");
  else router.replace("/dashboard");
}

/** Read `role` claim from JWT payload (unsigned decode — matches dashboard/header behaviour). */
export function roleFromJwt(token: string): string | undefined {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return typeof payload.role === "string" ? payload.role : undefined;
  } catch {
    return undefined;
  }
}

/** Read pending `redirect` from the login page URL (client-only). */
export function redirectFromSearch(search: string): string | null {
  if (!search.startsWith("?")) return null;
  return sanitizeRedirectParam(new URLSearchParams(search.slice(1)).get("redirect"));
}

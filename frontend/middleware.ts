import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "schoolsetu_token";

type JwtPayload = {
  id: string;
  role: string;
  phone?: string;
  email?: string;
  name?: string;
};

function loginRedirect(request: NextRequest): NextResponse {
  const url = new URL("/auth/login", request.url);
  url.searchParams.set(
    "redirect",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(url);
}

async function verifyToken(token: string): Promise<JwtPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // ── /admin/* — requires role="admin" ─────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return loginRedirect(request);
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return loginRedirect(request);
    }
    if (payload.role !== "admin") {
      return loginRedirect(request);
    }
    return NextResponse.next();
  }

  // ── /school/dashboard/* — role "school" or "admin" ──────────────────────────
  if (pathname.startsWith("/school/dashboard")) {
    if (!token) {
      return loginRedirect(request);
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return loginRedirect(request);
    }
    if (payload.role !== "school" && payload.role !== "admin") {
      return loginRedirect(request);
    }
    return NextResponse.next();
  }

  // ── /dashboard/* — parents only (admin/school go to their dashboards) ─────
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return loginRedirect(request);
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return loginRedirect(request);
    }
    if (payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (payload.role === "school") {
      return NextResponse.redirect(new URL("/school/dashboard", request.url));
    }
    if (payload.role !== "parent") {
      return loginRedirect(request);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/school/dashboard/:path*", "/dashboard/:path*"],
};

import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "schoolsetu_token";

type JwtPayload = {
  id: string;
  role: "parent" | "school" | "admin";
  phone?: string;
};

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

  // ── /admin/* — requires role="admin" ────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── /school/dashboard — requires role="school" or "admin" ───────────────────
  if (pathname.startsWith("/school/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (payload.role !== "school" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  // ── /dashboard — parent area; non-parents go to their own dashboard ─────────
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (payload.role === "school") {
      return NextResponse.redirect(new URL("/school/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/school/dashboard/:path*", "/dashboard/:path*"],
};

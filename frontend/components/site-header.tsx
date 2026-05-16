"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { GraduationCap, LogOut, Menu, MessageCircle, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAuthToken, getAuthToken } from "@/lib/auth-token";

const nav = [
  { href: "/schools/prayagraj", label: "Schools" },
  { href: "/ai-recommend", label: "AI Recommend" },
  { href: "/compare", label: "Compare" },
  { href: "/for-schools", label: "For Schools" },
];

/** Decode the role claim from a JWT without a library. */
function getRoleFromToken(token: string): string | null {
  try {
    return (JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [localToken, setLocalToken] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Re-read localStorage whenever the NextAuth session changes.
  // SessionBridge may have just written the backendToken there.
  useEffect(() => {
    setLocalToken(getAuthToken());
  }, [status, session?.backendToken]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Prefer NextAuth session; fall back to a stored backend JWT
  const isLoggedIn = status === "authenticated" || Boolean(localToken);
  const displayName =
    session?.user?.name ??
    session?.user?.email?.split("@")[0] ??
    (localToken ? "My Account" : null);
  const role =
    session?.backendUser?.role ??
    (localToken ? getRoleFromToken(localToken) : null);

  function handleLogout() {
    clearAuthToken();
    if (status === "authenticated") {
      void signOut({ callbackUrl: "/" });
    } else {
      window.location.href = "/";
    }
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-[#D3D1C7] bg-white/95 backdrop-blur"
    >
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold text-[#0C447C]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#E6F1FB] text-[#185FA5]">
            <GraduationCap size={24} />
          </span>
          SchoolSetu
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#2C2C2A] md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition hover:text-[#185FA5] ${
                pathname === item.href ? "text-[#185FA5]" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            /* Logged-in state */
            <div className="hidden items-center gap-2 sm:flex">
              {/* Role shortcut links */}
              {role === "admin" && (
                <Link href="/admin" className="text-xs font-semibold text-[#185FA5] hover:underline">
                  Admin
                </Link>
              )}
              {role === "school" && (
                <Link href="/school/dashboard" className="text-xs font-semibold text-[#185FA5] hover:underline">
                  Dashboard
                </Link>
              )}
              {/* User pill */}
              <div className="flex items-center gap-1.5 rounded-full border border-[#D3D1C7] bg-[#F1EFE8] px-3 py-1.5">
                <User size={14} className="text-[#55534e]" />
                <span className="max-w-[120px] truncate text-xs font-medium text-[#2C2C2A]">
                  {displayName}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D3D1C7] text-[#55534e] transition hover:border-[#A32D2D] hover:text-[#A32D2D]"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            /* Logged-out state */
            <Button asChild variant="amber" className="hidden sm:inline-flex">
              <Link href="/auth/parent/login">
                <MessageCircle size={17} />
                Login
              </Link>
            </Button>
          )}

          {/* Hamburger toggle — mobile only */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D3D1C7] bg-white text-[#2C2C2A] transition hover:border-[#185FA5] md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-[#D3D1C7] bg-white shadow-lg md:hidden">
          <nav className="flex flex-col py-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-6 py-3 text-sm font-medium transition hover:bg-[#F1EFE8] ${
                  pathname === item.href ? "text-[#185FA5]" : "text-[#2C2C2A]"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="mx-6 my-2 border-t border-[#D3D1C7]" />

            {isLoggedIn ? (
              <>
                <span className="px-6 py-2 text-xs font-medium text-[#888780]">
                  Signed in as {displayName}
                </span>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-6 py-3 text-sm font-semibold text-[#185FA5] transition hover:bg-[#F1EFE8]"
                  >
                    Admin Panel
                  </Link>
                )}
                {role === "school" && (
                  <Link
                    href="/school/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-6 py-3 text-sm font-semibold text-[#185FA5] transition hover:bg-[#F1EFE8]"
                  >
                    School Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                  className="mx-6 mb-3 mt-1 flex items-center justify-center gap-2 rounded-lg border border-[#D3D1C7] px-4 py-2.5 text-sm font-semibold text-[#A32D2D] transition hover:border-[#A32D2D] hover:bg-[#FCE8E8]"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/parent/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-[#185FA5] transition hover:bg-[#F1EFE8]"
                >
                  Parent Login
                </Link>
                <Link
                  href="/auth/school/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="mx-6 mb-3 mt-1 flex items-center justify-center rounded-lg border border-[#D3D1C7] px-4 py-2.5 text-sm font-semibold text-[#2C2C2A] transition hover:border-[#185FA5] hover:text-[#185FA5]"
                >
                  School Admin Login
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

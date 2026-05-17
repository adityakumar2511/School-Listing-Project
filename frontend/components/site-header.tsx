"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLogOut, FiUser, FiX } from "react-icons/fi";
import { MdMenu, MdSchool } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clearAuthToken, getAuthToken } from "@/lib/auth-token";

const nav = [
  { href: "/schools/prayagraj", label: "Schools" },
  { href: "/ai-recommend", label: "AI Recommend" },
  { href: "/compare", label: "Compare" },
  { href: "/for-schools", label: "For Schools" },
];

type JwtMinimal = {
  role?: string;
  name?: string;
  email?: string;
};

function decodeJwtPayload(token: string): JwtMinimal | null {
  try {
    return JSON.parse(atob(token.split(".")[1] ?? "")) as JwtMinimal;
  } catch {
    return null;
  }
}

function displayNameFromPayload(p: JwtMinimal | null): string {
  const n = p?.name?.trim();
  if (n) return n;
  const e = p?.email?.trim();
  if (e) return e.split("@")[0] ?? "Account";
  return "Account";
}

function roleBadgeTone(
  role: string,
): "blue" | "amber" | "success" | "neutral" | "danger" {
  if (role === "admin") return "danger";
  if (role === "school") return "blue";
  if (role === "parent") return "success";
  return "neutral";
}

export function SiteHeader() {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setToken(getAuthToken());
  }, [pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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

  const payload = token ? decodeJwtPayload(token) : null;
  const isLoggedIn = Boolean(token);
  const displayName = payload ? displayNameFromPayload(payload) : "";
  const role = payload?.role?.trim();

  function handleLogout() {
    clearAuthToken();
    window.location.href = "/";
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-[#D3D1C7] bg-white/95 backdrop-blur"
    >
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold text-[#0C447C]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#E6F1FB] text-[#185FA5]">
            <MdSchool size={24} />
          </span>
          SchoolSetu
        </Link>

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

        <div className="flex items-center gap-2">
          {isLoggedIn && role ? (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex items-center gap-2 rounded-full border border-[#D3D1C7] bg-[#F1EFE8] px-3 py-1.5">
                <FiUser size={14} className="text-[#55534e]" aria-hidden />
                <span className="max-w-[120px] truncate text-xs font-medium text-[#2C2C2A]">
                  {displayName}
                </span>
                <Badge tone={roleBadgeTone(role)} className="capitalize">
                  {role}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-[#A32D2D] hover:border-[#A32D2D]"
              >
                <FiLogOut size={14} aria-hidden />
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild variant="amber" className="hidden sm:inline-flex">
              <Link href="/auth/login">Login</Link>
            </Button>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D3D1C7] bg-white text-[#2C2C2A] transition hover:border-[#185FA5] md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FiX size={20} /> : <MdMenu size={20} />}
          </button>
        </div>
      </div>

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

            {isLoggedIn && role ? (
              <>
                <span className="flex flex-wrap items-center gap-2 px-6 py-2 text-xs font-medium text-[#888780]">
                  <span>Signed in as {displayName}</span>
                  <Badge tone={roleBadgeTone(role)} className="capitalize">
                    {role}
                  </Badge>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="mx-6 mb-3 mt-1 flex items-center justify-center gap-2 rounded-lg border border-[#D3D1C7] px-4 py-2.5 text-sm font-semibold text-[#A32D2D] transition hover:border-[#A32D2D] hover:bg-[#FCE8E8]"
                >
                  <FiLogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                className="mx-6 mb-3 mt-1 flex items-center justify-center rounded-lg bg-[#EF9F27] px-4 py-2.5 text-sm font-semibold text-[#633806]"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

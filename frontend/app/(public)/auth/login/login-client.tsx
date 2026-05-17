"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MdSchool } from "react-icons/md";
import { navigateAfterAuth, redirectFromSearch } from "@/lib/auth-routing";
import { setAuthToken } from "@/lib/auth-token";
import { AuthLoginColumn } from "./auth-login-column";

export function LoginClient() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.backendToken) {
      setAuthToken(session.backendToken);
      navigateAfterAuth(
        session.backendUser?.role,
        router,
        redirectFromSearch(window.location.search),
      );
    }
  }, [status, session?.backendToken, session?.backendUser?.role, router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <div className="container-shell mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-2xl font-bold text-[var(--blue-800)]">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--blue-50)] text-[var(--blue-600)]">
              <MdSchool size={24} />
            </span>
            SchoolSetu
          </Link>
          <h1 className="mt-4 font-heading text-2xl font-bold text-[var(--blue-900)] md:text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-[var(--gray-400)]">Sign in as a parent or as your school&apos;s administrator</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <AuthLoginColumn heading="Parent / Student Login" />
          <AuthLoginColumn heading="School Login" />
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-sm text-[var(--gray-400)]">
          <span>New here?</span>
          <Link href="/auth/register/parent" className="font-semibold text-[var(--blue-600)] hover:underline">
            Register as Parent
          </Link>
          <span className="hidden text-[var(--gray-100)] sm:inline" aria-hidden>
            |
          </span>
          <Link href="/auth/school/register" className="font-semibold text-brand-amber hover:underline">
            Register your School
          </Link>
        </footer>
      </div>
    </div>
  );
}

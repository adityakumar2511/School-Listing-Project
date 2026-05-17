import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { MdFamilyRestroom, MdSchool } from "react-icons/md";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Register — SchoolSetu",
  description: "Join SchoolSetu as a parent or register your school listing.",
};

export default function RegisterHubPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-4 py-16 text-[var(--foreground)]">
      <div className="container-shell mx-auto max-w-3xl">
        <header className="text-center">
          <h1 className="font-heading text-3xl font-bold text-[var(--blue-900)]">Create an account</h1>
          <p className="mt-2 text-[var(--gray-400)]">Choose how you&apos;d like to get started with SchoolSetu</p>
        </header>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link
            href="/auth/register/parent"
            className="group rounded-2xl border border-[var(--gray-100)] bg-white p-8 shadow-sm transition hover:border-[var(--blue-600)] hover:shadow-md"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--blue-50)] text-[var(--blue-600)]">
              <MdFamilyRestroom size={32} />
            </span>
            <h2 className="mt-5 font-heading text-xl font-bold text-[var(--blue-900)] group-hover:text-[var(--blue-600)]">
              Parent / Student
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#55534e]">
              Save favourite schools, send inquiries, and get personalised recommendations.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue-600)]">
              Register as parent <FiArrowRight size={16} />
            </span>
          </Link>

          <Link
            href="/auth/register/school"
            className="group rounded-2xl border border-[var(--gray-100)] bg-white p-8 shadow-sm transition hover:border-brand-amber hover:shadow-md"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--amber-50)] text-[var(--amber-600)]">
              <MdSchool size={32} />
            </span>
            <h2 className="mt-5 font-heading text-xl font-bold text-[var(--blue-900)] group-hover:text-brand-amber">
              School listing
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#55534e]">
              List your school, verify your profile, and receive parent enquiries on WhatsApp.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-amber">
              Register your school <FiArrowRight size={16} />
            </span>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline">
            <Link href="/auth/login">Already registered? Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

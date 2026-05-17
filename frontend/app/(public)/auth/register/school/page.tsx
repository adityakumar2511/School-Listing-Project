import type { Metadata } from "next";
import { Suspense } from "react";
import { FiLoader } from "react-icons/fi";
import { RegisterSchoolClient } from "./register-school-client";

export const metadata: Metadata = {
  title: "Register Your School — SchoolSetu",
  description: "Create a SchoolSetu school owner account and submit your listing for verification.",
};

export default function RegisterSchoolPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--background)]">
          <FiLoader className="animate-spin text-[var(--blue-600)]" size={28} aria-label="Loading" />
        </div>
      }
    >
      <RegisterSchoolClient />
    </Suspense>
  );
}

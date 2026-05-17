import type { Metadata } from "next";
import { Suspense } from "react";
import { FiLoader } from "react-icons/fi";
import { RegisterParentClient } from "./register-parent-client";

export const metadata: Metadata = {
  title: "Register as Parent — SchoolSetu",
  description: "Create a SchoolSetu parent account to explore schools and send inquiries.",
};

export default function RegisterParentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[var(--background)]">
          <FiLoader className="animate-spin text-[var(--blue-600)]" size={28} aria-label="Loading" />
        </div>
      }
    >
      <RegisterParentClient />
    </Suspense>
  );
}

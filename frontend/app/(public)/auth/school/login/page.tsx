import type { Metadata } from "next";
import { SchoolLoginForm } from "./school-login-form";

export const metadata: Metadata = {
  title: "School Admin Login — SchoolSetu",
  description: "Sign in to manage your school listing, inquiries, and profile on SchoolSetu.",
};

export default function SchoolLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F1EFE8] px-4 py-12">
      <SchoolLoginForm />
    </div>
  );
}

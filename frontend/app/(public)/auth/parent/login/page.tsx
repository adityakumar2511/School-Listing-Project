import type { Metadata } from "next";
import { ParentLoginForm } from "./parent-login-form";

export const metadata: Metadata = {
  title: "Parent Login — SchoolSetu",
  description: "Sign in to your SchoolSetu parent account to track school inquiries.",
};

export default function ParentLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F1EFE8] px-4 py-12">
      <ParentLoginForm />
    </div>
  );
}

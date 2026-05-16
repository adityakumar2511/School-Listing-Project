import type { Metadata } from "next";
import { SchoolRegisterForm } from "./school-register-form";

export const metadata: Metadata = {
  title: "Register Your School — SchoolSetu",
  description:
    "List your school on SchoolSetu in 4 quick steps. Reach thousands of parents searching for the right school.",
};

export default function SchoolRegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F1EFE8] px-4 py-10">
      <SchoolRegisterForm />
    </div>
  );
}

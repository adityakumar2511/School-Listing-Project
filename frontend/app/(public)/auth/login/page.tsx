import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In — SchoolSetu",
  description: "Sign in to your SchoolSetu account as a parent or school administrator.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#F1EFE8] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-2xl font-bold text-[#0C447C]">
            🎓 SchoolSetu
          </Link>
          <p className="mt-2 text-sm text-[#888780]">Choose how you want to sign in</p>
        </div>

        {/* Role cards */}
        <div className="space-y-4">
          {/* Parent card */}
          <Link href="/auth/parent/login" className="group block">
            <div className="rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm transition-all hover:border-[#185FA5] hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[#E6F1FB] text-3xl">
                  👨‍👩‍👧
                </span>
                <div className="flex-1">
                  <h2 className="font-heading text-xl font-bold text-[#042C53] group-hover:text-[#185FA5]">
                    Parent Login
                  </h2>
                  <p className="mt-1 text-sm text-[#55534e]">
                    Find and inquire about schools for your child
                  </p>
                </div>
              </div>
              <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-[#0C447C]">
                Continue as Parent →
              </div>
            </div>
          </Link>

          {/* School Admin card */}
          <Link href="/auth/school/login" className="group block">
            <div className="rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm transition-all hover:border-[#185FA5] hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-[#F1EFE8] text-3xl">
                  🏫
                </span>
                <div className="flex-1">
                  <h2 className="font-heading text-xl font-bold text-[#042C53] group-hover:text-[#185FA5]">
                    School Admin Login
                  </h2>
                  <p className="mt-1 text-sm text-[#55534e]">
                    Manage your school listing and inquiries
                  </p>
                </div>
              </div>
              <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#D3D1C7] bg-white px-4 py-3 text-sm font-semibold text-[#2C2C2A] transition-colors group-hover:border-[#185FA5] group-hover:text-[#185FA5]">
                Continue as School →
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-[#888780]">
          New here?{" "}
          <Link href="/auth/register" className="font-semibold text-[#185FA5] hover:underline">
            Create account →
          </Link>
        </p>
      </div>
    </div>
  );
}

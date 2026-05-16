import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Setup — SchoolSetu (dev only)",
  robots: { index: false, follow: false },
};

// Keep this phone number in sync with backend/src/prisma/seed.ts → ADMIN_PHONE.
// Update both places together when you change the admin user.
const ADMIN_PHONE = "+91XXXXXXXXXX";
const ADMIN_NAME = "SchoolSetu Admin";

export default function AdminSetupPage() {
  // 404 in production — this page must never be reachable on a deployed site.
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const phoneFormatted = (() => {
    const digits = ADMIN_PHONE.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return ADMIN_PHONE;
  })();
  const isPlaceholder = ADMIN_PHONE.includes("X");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F1EFE8] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Dev-only banner */}
        <div className="mb-6 rounded-xl border border-[#A32D2D] bg-[#FCE8E8] px-4 py-3 text-sm text-[#A32D2D]">
          <strong>DEVELOPMENT ONLY</strong> — this page returns 404 in production. It exists so you
          always know which phone number unlocks the admin panel.
        </div>

        <h1 className="font-heading text-3xl font-bold text-[#042C53]">Admin Setup</h1>
        <p className="mt-2 text-sm text-[#888780]">
          How admin authentication works in SchoolSetu and how to log in locally.
        </p>

        {/* Credentials card */}
        <div className="mt-6 rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-[#0C447C]">Admin Credentials</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex items-baseline justify-between gap-4 border-b border-[#D3D1C7] pb-3">
              <dt className="text-[#888780]">Phone</dt>
              <dd className="font-mono text-base font-semibold text-[#042C53]">{phoneFormatted}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-[#D3D1C7] pb-3">
              <dt className="text-[#888780]">Name</dt>
              <dd className="font-semibold text-[#042C53]">{ADMIN_NAME}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-[#D3D1C7] pb-3">
              <dt className="text-[#888780]">Role</dt>
              <dd className="inline-flex items-center rounded-full bg-[#FCE8E8] px-2.5 py-0.5 text-xs font-semibold text-[#A32D2D]">
                admin
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#888780]">Login URL</dt>
              <dd>
                <Link
                  href="/auth/parent/login"
                  className="font-semibold text-[#185FA5] hover:underline"
                >
                  /auth/parent/login →
                </Link>
              </dd>
            </div>
          </dl>

          {isPlaceholder && (
            <div className="mt-4 rounded-lg border border-[#EF9F27] bg-[#FAEEDA] px-4 py-3 text-sm text-[#633806]">
              <strong>Action required:</strong> The phone number above is a placeholder (
              <code className="font-mono">+91XXXXXXXXXX</code>). Edit{" "}
              <code className="font-mono">backend/src/prisma/seed.ts</code> and{" "}
              <code className="font-mono">app/admin/setup/page.tsx</code> with your real phone
              number, then re-run <code className="font-mono">npm run seed --workspace backend</code>.
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-6 rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm">
          <h2 className="font-heading text-xl font-bold text-[#0C447C]">
            How Admin Login Works
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-[#2C2C2A]">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#185FA5] text-xs font-bold text-white">
                1
              </span>
              <span>
                Run <code className="rounded bg-[#F1EFE8] px-1.5 py-0.5 font-mono text-xs">
                  npm run seed --workspace backend
                </code>{" "}
                — this upserts a user with{" "}
                <code className="rounded bg-[#F1EFE8] px-1.5 py-0.5 font-mono text-xs">
                  role=&quot;admin&quot;
                </code>{" "}
                and the phone above.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#185FA5] text-xs font-bold text-white">
                2
              </span>
              <span>
                Open <code className="rounded bg-[#F1EFE8] px-1.5 py-0.5 font-mono text-xs">
                  /auth/parent/login
                </code>{" "}
                — the parent OTP form is the only OTP entry point. Enter the admin phone and click{" "}
                <em>Send OTP</em>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#185FA5] text-xs font-bold text-white">
                3
              </span>
              <span>
                The backend matches the phone in the <code className="font-mono">User</code>{" "}
                table, sees <code className="font-mono">role=&quot;admin&quot;</code>, and signs a JWT
                with that role. <code className="font-mono">ADMIN_LOGIN</code> is written to{" "}
                <code className="font-mono">AuditLog</code>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#185FA5] text-xs font-bold text-white">
                4
              </span>
              <span>
                The frontend reads the role from the response and redirects:{" "}
                <code className="font-mono">admin → /admin</code>,{" "}
                <code className="font-mono">school → /school/dashboard</code>,{" "}
                <code className="font-mono">parent → /dashboard</code>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#185FA5] text-xs font-bold text-white">
                5
              </span>
              <span>
                <code className="font-mono">middleware.ts</code> verifies the JWT on every request
                to <code className="font-mono">/admin/*</code> and sends non-admins back to{" "}
                <code className="font-mono">/auth/login</code>.
              </span>
            </li>
          </ol>
        </div>

        {/* Quick links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/auth/parent/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#185FA5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0C447C]"
          >
            Go to Login →
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-[#D3D1C7] bg-white px-5 py-2.5 text-sm font-semibold text-[#2C2C2A] transition hover:border-[#185FA5]"
          >
            Open Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}

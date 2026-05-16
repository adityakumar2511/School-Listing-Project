"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const cities = ["Prayagraj", "Banda", "Kanpur", "Jhansi", "Lucknow"];

const parentSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal(""))
});

const schoolSchema = z.object({
  schoolName: z.string().trim().min(2, "Enter school name"),
  contactPersonName: z.string().trim().min(2, "Enter contact person name"),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  city: z.string().min(1, "Select a city")
});

type ParentValues = z.infer<typeof parentSchema>;
type SchoolValues = z.infer<typeof schoolSchema>;
type Role = "parent" | "school";

function formatPhone(phone: string) {
  return `+91${phone}`;
}

function fieldClass(hasError?: boolean) {
  return cn(
    "w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-[#185FA5]",
    hasError ? "border-red-400" : "border-[#D3D1C7]"
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const parentForm = useForm<ParentValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: { fullName: "", phone: "", email: "" }
  });

  const schoolForm = useForm<SchoolValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues: { schoolName: "", contactPersonName: "", phone: "", city: "" }
  });

  async function submitParent(values: ParentValues) {
    setSuccessMessage("");
    setSubmitError("");
    const phone = formatPhone(values.phone);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      if (!response.ok) throw new Error("Unable to send OTP");
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(phone)}`);
    } catch {
      setSubmitError("Could not send OTP. Please check the phone number and try again.");
    }
  }

  async function submitSchool(values: SchoolValues) {
    setSuccessMessage("");
    setSubmitError("");
    try {
      const response = await fetch(`${API_URL}/api/schools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.schoolName,
          contactPersonName: values.contactPersonName,
          phone: formatPhone(values.phone),
          city: values.city
        })
      });
      if (!response.ok && response.status !== 401 && response.status !== 403) {
        throw new Error("Unable to register school");
      }
      schoolForm.reset();
      setSuccessMessage("School registration submitted. Our team will contact you shortly.");
    } catch {
      setSubmitError("Could not register the school right now. Please try again.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F1EFE8] px-4 py-10 text-[#2C2C2A]">
      <div className="mx-auto mt-10 w-full max-w-md rounded-xl border border-[#D3D1C7] bg-white p-8 shadow-md md:mt-20">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-[#E6F1FB] text-[#185FA5]">
          <GraduationCap size={30} />
        </div>
        <div className="mt-5 text-center">
          <h1 className="font-heading text-2xl font-bold text-[#0C447C]">Create Account</h1>
          <p className="mt-2 text-sm text-gray-500">Join as a parent or list your school</p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setRole("parent"); setSuccessMessage(""); setSubmitError(""); }}
            className={cn(
              "rounded-xl border p-4 text-left transition",
              role === "parent" ? "border-[#185FA5] bg-blue-50" : "border-[#D3D1C7] bg-white hover:border-[#85B7EB]"
            )}
          >
            <span className="text-2xl" aria-hidden="true">👨‍👩‍👧</span>
            <span className="mt-3 block text-sm font-semibold text-[#0C447C]">I&apos;m a Parent</span>
            <span className="mt-1 block text-xs leading-5 text-[#55534e]">Find schools for my child</span>
          </button>

          <button
            type="button"
            onClick={() => { setRole("school"); setSuccessMessage(""); setSubmitError(""); }}
            className={cn(
              "rounded-xl border p-4 text-left transition",
              role === "school" ? "border-[#185FA5] bg-blue-50" : "border-[#D3D1C7] bg-white hover:border-[#85B7EB]"
            )}
          >
            <span className="text-2xl" aria-hidden="true">🏫</span>
            <span className="mt-3 block text-sm font-semibold text-[#0C447C]">I&apos;m a School</span>
            <span className="mt-1 block text-xs leading-5 text-[#55534e]">List my school for free</span>
          </button>
        </div>

        {!role && (
          <p className="mt-5 rounded-lg border border-[#D3D1C7] bg-[#F1EFE8] px-4 py-3 text-center text-sm text-[#55534e]">
            Choose a role to continue.
          </p>
        )}

        {role === "parent" && (
          <form onSubmit={parentForm.handleSubmit(submitParent)} className="mt-6 grid gap-4">
            <label className="grid gap-1 text-sm font-medium">
              Full Name
              <input className={fieldClass(Boolean(parentForm.formState.errors.fullName))} {...parentForm.register("fullName")} />
              {parentForm.formState.errors.fullName && (
                <span className="text-xs text-red-600">{parentForm.formState.errors.fullName.message}</span>
              )}
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Phone Number
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[#D3D1C7] bg-[#F1EFE8] px-3 text-sm text-[#55534e]">+91</span>
                <input
                  inputMode="numeric"
                  maxLength={10}
                  className={cn(fieldClass(Boolean(parentForm.formState.errors.phone)), "rounded-l-none")}
                  {...parentForm.register("phone")}
                />
              </div>
              {parentForm.formState.errors.phone && (
                <span className="text-xs text-red-600">{parentForm.formState.errors.phone.message}</span>
              )}
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Email <span className="font-normal text-[#888780]">(optional)</span>
              <input className={fieldClass(Boolean(parentForm.formState.errors.email))} {...parentForm.register("email")} />
              {parentForm.formState.errors.email && (
                <span className="text-xs text-red-600">{parentForm.formState.errors.email.message}</span>
              )}
            </label>
            {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}
            <button
              type="submit"
              disabled={parentForm.formState.isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#EF9F27] px-4 font-semibold text-[#633806] transition hover:bg-[#d98c18] disabled:opacity-60"
            >
              {parentForm.formState.isSubmitting && <Loader2 className="animate-spin" size={18} />}
              Send OTP
            </button>
          </form>
        )}

        {role === "school" && (
          <form onSubmit={schoolForm.handleSubmit(submitSchool)} className="mt-6 grid gap-4">
            <label className="grid gap-1 text-sm font-medium">
              School Name
              <input className={fieldClass(Boolean(schoolForm.formState.errors.schoolName))} {...schoolForm.register("schoolName")} />
              {schoolForm.formState.errors.schoolName && (
                <span className="text-xs text-red-600">{schoolForm.formState.errors.schoolName.message}</span>
              )}
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Contact Person Name
              <input className={fieldClass(Boolean(schoolForm.formState.errors.contactPersonName))} {...schoolForm.register("contactPersonName")} />
              {schoolForm.formState.errors.contactPersonName && (
                <span className="text-xs text-red-600">{schoolForm.formState.errors.contactPersonName.message}</span>
              )}
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Phone Number
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[#D3D1C7] bg-[#F1EFE8] px-3 text-sm text-[#55534e]">+91</span>
                <input
                  inputMode="numeric"
                  maxLength={10}
                  className={cn(fieldClass(Boolean(schoolForm.formState.errors.phone)), "rounded-l-none")}
                  {...schoolForm.register("phone")}
                />
              </div>
              {schoolForm.formState.errors.phone && (
                <span className="text-xs text-red-600">{schoolForm.formState.errors.phone.message}</span>
              )}
            </label>
            <label className="grid gap-1 text-sm font-medium">
              City
              <select className={fieldClass(Boolean(schoolForm.formState.errors.city))} {...schoolForm.register("city")}>
                <option value="">Select city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {schoolForm.formState.errors.city && (
                <span className="text-xs text-red-600">{schoolForm.formState.errors.city.message}</span>
              )}
            </label>
            {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}
            {successMessage && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{successMessage}</p>}
            <button
              type="submit"
              disabled={schoolForm.formState.isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#185FA5] px-4 font-semibold text-white transition hover:bg-[#0C447C] disabled:opacity-60"
            >
              {schoolForm.formState.isSubmitting && <Loader2 className="animate-spin" size={18} />}
              Register School
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#55534e]">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#185FA5] hover:text-[#0C447C]">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

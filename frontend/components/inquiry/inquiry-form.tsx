"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, LogIn, Loader2, Send, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authHeaders, getAuthToken } from "@/lib/auth-token";
import { API_URL } from "@/lib/schools-api";
import { cn } from "@/lib/utils";

// ─── Zod schema ──────────────────────────────────────────────────────────────

const inquirySchema = z.object({
  parentName: z.string().trim().min(2, "Enter your full name"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  childName: z.string().trim().min(2, "Enter student's name"),
  classApplying: z.string().min(1, "Select the class applying for"),
  message: z.string().trim().max(500).optional()
});

type InquiryValues = z.infer<typeof inquirySchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

const CLASS_OPTIONS = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)
];

const DUPLICATE_ERROR_CODE = 409;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fieldClass(hasError?: boolean) {
  return cn(
    "w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition",
    "focus:ring-2 focus:ring-[#185FA5] focus:border-[#185FA5]",
    hasError
      ? "border-[#A32D2D] bg-[#FCEBEB]"
      : "border-[#D3D1C7] bg-white hover:border-[#185FA5]"
  );
}

/** Decode the phone from a JWT without a library (payload is plain base64url JSON). */
function phoneFromToken(token: string | null): string {
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") ?? "")) as {
      phone?: string;
    };
    const digits = (payload.phone ?? "").replace(/\D/g, "").slice(-10);
    return digits.length === 10 ? digits : "";
  } catch {
    return "";
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type InquiryFormProps = {
  schoolId: string;
  schoolName: string;
  /** Called after the modal/container should close on success */
  onSuccess?: () => void;
};

type ApiError = {
  error?: string;
  message?: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export function InquiryForm({ schoolId, schoolName, onSuccess }: InquiryFormProps) {
  const token = getAuthToken();
  const isLoggedIn = Boolean(token);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      parentName: "",
      phone: "",
      childName: "",
      classApplying: "",
      message: ""
    }
  });

  // Pre-fill phone from JWT if available
  useEffect(() => {
    const digits = phoneFromToken(token);
    if (digits) setValue("phone", digits);
  }, [token, setValue]);

  const mutation = useMutation({
    mutationFn: async (values: InquiryValues) => {
      const response = await fetch(`${API_URL}/api/inquiries`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          schoolId,
          parentName: values.parentName,
          phone: `+91${values.phone}`,
          childName: values.childName,
          grade: values.classApplying,
          message: values.message || undefined
        })
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiError;
        const message = body.error ?? body.message ?? "Could not submit inquiry. Please try again.";
        // Attach the HTTP status to distinguish 409 in the UI
        const err = new Error(message) as Error & { status: number };
        err.status = response.status;
        throw err;
      }

      // Successful – no body needed
    },
    onSuccess: () => {
      reset();
      onSuccess?.();
    }
  });

  // ── Not logged in ────────────────────────────────────────────────────────

  if (!isLoggedIn) {
    return (
      <div className="grid gap-4 rounded-xl border border-[#D3D1C7] bg-white p-6">
        <div className="flex items-start gap-3 rounded-lg bg-[#E6F1FB] p-4">
          <LogIn className="mt-0.5 shrink-0 text-[#185FA5]" size={20} />
          <div>
            <p className="font-semibold text-[#0C447C]">Sign in to send an inquiry</p>
            <p className="mt-1 text-sm text-[#55534e]">
              We verify parents via OTP so schools receive only genuine leads.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="border-[#185FA5] text-[#185FA5]">
            <Link href={`/auth/login?next=/schools/${schoolId}`}>Login</Link>
          </Button>
          <Button asChild variant="amber">
            <Link href={`/auth/register?next=/schools/${schoolId}`}>Register free</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────

  if (mutation.isSuccess) {
    return (
      <div className="grid place-items-center gap-3 rounded-xl border border-[#D3D1C7] bg-[#EAF3DE] p-8 text-center">
        <CheckCircle2 className="text-[#3B6D11]" size={40} />
        <div>
          <p className="font-heading text-lg font-bold text-[#3B6D11]">Inquiry submitted!</p>
          <p className="mt-1 text-sm text-[#2C2C2A]">
            {schoolName} will contact you on{" "}
            <span className="font-semibold text-[#25D366]">WhatsApp</span> within 24 hours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            mutation.reset();
          }}
          className="mt-2 text-xs font-medium text-[#185FA5] underline-offset-2 hover:underline"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  // ── 409 Duplicate state ───────────────────────────────────────────────────

  const mutationError = mutation.error as (Error & { status?: number }) | null;
  const isDuplicate = mutationError?.status === DUPLICATE_ERROR_CODE;

  if (isDuplicate) {
    return (
      <div className="grid gap-4 rounded-xl border border-[#D3D1C7] bg-white p-6">
        <div className="flex items-start gap-3 rounded-lg bg-[#FAEEDA] p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-[#EF9F27]" size={20} />
          <div>
            <p className="font-semibold text-[#633806]">Inquiry already submitted</p>
            <p className="mt-1 text-sm text-[#633806]">
              You have already sent an inquiry for <strong>{schoolName}</strong> within the last 7 days. The school
              will contact you on WhatsApp shortly.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => mutation.reset()}
          className="border-[#D3D1C7] text-[#55534e]"
        >
          Got it
        </Button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="grid gap-4 rounded-xl border border-[#D3D1C7] bg-white p-5"
      noValidate
    >
      {/* Header */}
      <div>
        <p className="font-heading text-xl font-bold text-[#0C447C]">Send admission inquiry</p>
        <p className="mt-1 text-sm text-[#55534e]">
          Inquiry for <span className="font-medium text-[#2C2C2A]">{schoolName}</span>. School will call/WhatsApp
          you within 24 hours.
        </p>
      </div>

      {/* Parent name */}
      <label className="grid gap-1 text-sm font-medium text-[#2C2C2A]">
        Your name (parent / guardian)
        <input
          type="text"
          autoComplete="name"
          placeholder="e.g. Ramesh Kumar"
          className={fieldClass(Boolean(errors.parentName))}
          {...register("parentName")}
        />
        {errors.parentName && (
          <span className="text-xs text-[#A32D2D]">{errors.parentName.message}</span>
        )}
      </label>

      {/* Phone */}
      <label className="grid gap-1 text-sm font-medium text-[#2C2C2A]">
        WhatsApp / phone number
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[#D3D1C7] bg-[#F1EFE8] px-3 text-sm text-[#55534e]">
            +91
          </span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel-national"
            placeholder="9XXXXXXXXX"
            className={cn(fieldClass(Boolean(errors.phone)), "rounded-l-none")}
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <span className="text-xs text-[#A32D2D]">{errors.phone.message}</span>
        )}
      </label>

      {/* Child name */}
      <label className="grid gap-1 text-sm font-medium text-[#2C2C2A]">
        Student's name
        <input
          type="text"
          placeholder="e.g. Ananya Kumar"
          className={fieldClass(Boolean(errors.childName))}
          {...register("childName")}
        />
        {errors.childName && (
          <span className="text-xs text-[#A32D2D]">{errors.childName.message}</span>
        )}
      </label>

      {/* Class applying */}
      <label className="grid gap-1 text-sm font-medium text-[#2C2C2A]">
        Class applying for
        <select
          className={fieldClass(Boolean(errors.classApplying))}
          {...register("classApplying")}
          defaultValue=""
        >
          <option value="" disabled>
            Select class
          </option>
          {CLASS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.classApplying && (
          <span className="text-xs text-[#A32D2D]">{errors.classApplying.message}</span>
        )}
      </label>

      {/* Message */}
      <label className="grid gap-1 text-sm font-medium text-[#2C2C2A]">
        Message{" "}
        <span className="font-normal text-[#888780]">(optional)</span>
        <textarea
          rows={3}
          placeholder="Any specific question about fees, hostel, transport…"
          className={fieldClass()}
          {...register("message")}
        />
      </label>

      {/* Generic error banner */}
      {mutation.isError && !isDuplicate && (
        <div className="flex items-start gap-2 rounded-lg bg-[#FCEBEB] px-3 py-2.5">
          <AlertTriangle className="mt-0.5 shrink-0 text-[#A32D2D]" size={16} />
          <p className="text-sm text-[#A32D2D]">{mutationError?.message}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="amber"
        disabled={mutation.isPending}
        className="mt-1 w-full"
      >
        {mutation.isPending ? (
          <Loader2 className="animate-spin" size={17} />
        ) : (
          <Send size={17} />
        )}
        {mutation.isPending ? "Submitting…" : "Submit Inquiry"}
      </Button>
    </form>
  );
}

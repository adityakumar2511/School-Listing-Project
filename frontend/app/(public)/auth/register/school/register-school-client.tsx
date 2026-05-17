"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FiArrowRight,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiLoader,
} from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authErrorMessage, postAuthJson } from "@/lib/auth-api";
import { setAuthToken } from "@/lib/auth-token";
import { cn } from "@/lib/utils";

const STEPS = ["Account", "School details", "Review"] as const;

const BOARD_OPTIONS = ["CBSE", "ICSE", "UP Board", "IB", "Others"] as const;
type BoardChoice = (typeof BOARD_OPTIONS)[number];

const PRIMARY_BOARDS: readonly Exclude<BoardChoice, "Others">[] = ["CBSE", "ICSE", "UP Board", "IB"];

const SCHOOL_TYPES = ["Private", "Government", "Aided", "International"] as const;

const YEAR_MAX = new Date().getFullYear();

function inputClass(fieldError?: boolean) {
  return cn(
    "mt-1 w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--blue-600)] focus:ring-2 focus:ring-[var(--blue-600)]",
    fieldError ? "border-[#A32D2D]" : "border-[var(--gray-100)]",
  );
}

const step1Schema = z
  .object({
    ownerName: z.string().trim().min(1, "Owner name is required"),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    phone: z.string().trim(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((val, ctx) => {
    const digits = val.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(digits)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid 10-digit Indian mobile number",
        path: ["phone"],
      });
    }
  });

const step2Schema = z
  .object({
    schoolName: z.string().trim().min(2, "School name is required"),
    schoolType: z.enum(SCHOOL_TYPES),
    establishedYear: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Enter a valid 4-digit year")
      .refine((y) => {
        const n = Number(y);
        return n >= 1800 && n <= YEAR_MAX;
      }, `Year must be between 1800 and ${YEAR_MAX}`),
    principalName: z.string().trim().min(1, "Principal name is required"),
    boards: z.array(z.enum(BOARD_OPTIONS)).min(1, "Select at least one board affiliation"),
    street: z.string().trim().min(1, "Street address is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    website: z.string().trim(),
    description: z.string().trim().min(10, "Add a description (at least 10 characters)"),
  })
  .superRefine((val, ctx) => {
    const hasPrimary = val.boards.some((b): b is (typeof PRIMARY_BOARDS)[number] =>
      PRIMARY_BOARDS.includes(b as (typeof PRIMARY_BOARDS)[number]),
    );
    if (!hasPrimary) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one of CBSE, ICSE, UP Board, or IB (Others is optional)",
        path: ["boards"],
      });
    }
    const w = val.website.trim();
    if (w.length > 0 && !/^https?:\/\/.+/i.test(w)) {
      ctx.addIssue({
        code: "custom",
        message: "Website must start with http:// or https://",
        path: ["website"],
      });
    }
  });

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

type SchoolRegisterFormValues = Step1Values & Step2Values;

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

type OtpValues = z.infer<typeof otpSchema>;

const STEP1_FIELDS = ["ownerName", "email", "password", "confirmPassword", "phone"] as const satisfies readonly (
  keyof SchoolRegisterFormValues
)[];
const STEP2_FIELDS = [
  "schoolName",
  "schoolType",
  "establishedYear",
  "principalName",
  "boards",
  "street",
  "city",
  "state",
  "pincode",
  "website",
  "description",
] as const satisfies readonly (keyof SchoolRegisterFormValues)[];

export function RegisterSchoolClient() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [phase, setPhase] = React.useState<"wizard" | "otp" | "success">("wizard");
  const [registeredEmail, setRegisteredEmail] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [showPw2, setShowPw2] = React.useState(false);
  const [stepBusy, setStepBusy] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");
  const [otpError, setOtpError] = React.useState("");
  const [otpHint, setOtpHint] = React.useState("");
  const [dashBusy, setDashBusy] = React.useState(false);

  const form = useForm<SchoolRegisterFormValues>({
    resolver: undefined,
    defaultValues: {
      ownerName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      schoolName: "",
      schoolType: "Private",
      establishedYear: "",
      principalName: "",
      boards: [],
      street: "",
      city: "",
      state: "",
      pincode: "",
      website: "",
      description: "",
    },
    mode: "onChange",
  });

  const otpForm = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function validateStep1(): Promise<boolean> {
    const data = form.getValues();
    const parsed = step1Schema.safeParse({
      ownerName: data.ownerName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phone: data.phone,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string") {
          form.setError(path as keyof SchoolRegisterFormValues, { message: issue.message });
        }
      }
      return false;
    }
    for (const key of STEP1_FIELDS) {
      form.clearErrors(key);
    }
    return true;
  }

  async function validateStep2(): Promise<boolean> {
    const data = form.getValues();
    const parsed = step2Schema.safeParse({
      schoolName: data.schoolName,
      schoolType: data.schoolType,
      establishedYear: data.establishedYear,
      principalName: data.principalName,
      boards: data.boards,
      street: data.street,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      website: data.website,
      description: data.description,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0];
        if (typeof path === "string") {
          form.setError(path as keyof SchoolRegisterFormValues, { message: issue.message });
        }
      }
      return false;
    }
    for (const key of STEP2_FIELDS) {
      form.clearErrors(key);
    }
    return true;
  }

  async function handleNext() {
    setStepBusy(true);
    try {
      if (step === 1) {
        const ok = await validateStep1();
        if (ok) setStep(2);
        return;
      }
      if (step === 2) {
        const ok = await validateStep2();
        if (ok) setStep(3);
      }
    } finally {
      setStepBusy(false);
    }
  }

  function handleBack() {
    if (phase !== "wizard") return;
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }

  async function onRegisterSubmit(values: SchoolRegisterFormValues) {
    const s1 = step1Schema.safeParse({
      ownerName: values.ownerName,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      phone: values.phone,
    });
    const s2 = step2Schema.safeParse({
      schoolName: values.schoolName,
      schoolType: values.schoolType,
      establishedYear: values.establishedYear,
      principalName: values.principalName,
      boards: values.boards,
      street: values.street,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      website: values.website,
      description: values.description,
    });
    if (!s1.success || !s2.success) {
      const merged = [...(s1.success ? [] : s1.error.issues), ...(s2.success ? [] : s2.error.issues)];
      for (const issue of merged) {
        const path = issue.path[0];
        if (typeof path === "string") {
          form.setError(path as keyof SchoolRegisterFormValues, { message: issue.message });
        }
      }
      setSubmitError("Please fix the highlighted fields.");
      return;
    }

    setSubmitError("");
    const digits = values.phone.replace(/\D/g, "");
    const phone = `+91${digits}`;
    const boardsPayload = values.boards.filter((b): b is Exclude<BoardChoice, "Others"> => b !== "Others");
    const websiteTrim = values.website.trim();

    const payload = {
      ownerName: values.ownerName.trim(),
      email: values.email.trim(),
      password: values.password,
      phone,
      schoolName: values.schoolName.trim(),
      address: `${values.street.trim()} — PIN ${values.pincode}`,
      city: values.city.trim(),
      state: values.state.trim(),
      board: boardsPayload,
      schoolType: values.schoolType,
      description: values.description.trim(),
      established: Number(values.establishedYear),
      principalName: values.principalName.trim(),
      ...(websiteTrim.length > 0 ? { website: websiteTrim } : {}),
    };

    const res = await postAuthJson<{ message?: string }>("/register/school", payload);
    if (!res.ok) {
      setSubmitError(authErrorMessage(res.data));
      return;
    }

    const emailNorm = values.email.trim().toLowerCase();
    setRegisteredEmail(emailNorm);
    setPhase("otp");
    otpForm.reset();
    setOtpHint(res.data.message ?? "Check your inbox for a verification code.");
  }

  async function onVerifyOtp(values: OtpValues) {
    setOtpError("");
    const res = await postAuthJson<{ token?: string }>("/verify-email-otp", {
      email: registeredEmail,
      otp: values.otp,
    });
    if (!res.ok || !res.data.token) {
      setOtpError(authErrorMessage(res.data));
      return;
    }
    setAuthToken(res.data.token);
    setPhase("success");
  }

  function toggleBoard(b: BoardChoice) {
    const cur = form.getValues("boards");
    const next = cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b];
    form.setValue("boards", next, { shouldValidate: true, shouldDirty: true });
    form.clearErrors("boards");
  }

  const progressPct = (step / STEPS.length) * 100;
  const values = form.watch();

  if (phase === "success") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
        <div className="mx-auto w-full max-w-lg rounded-2xl border border-[var(--gray-100)] bg-white p-8 shadow-sm md:p-10">
          <div className="flex justify-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#EAF3DE] text-[#3B6D11]">
              <FiCheck size={32} aria-hidden />
            </span>
          </div>
          <h1 className="mt-6 text-center font-heading text-2xl font-bold text-[var(--blue-900)]">
            Registration submitted!
          </h1>
          <p className="mt-4 text-center text-sm leading-relaxed text-[#55534e]">
            Your school will appear on SchoolSetu after admin verification. We&apos;ll notify you at{" "}
            <strong className="text-[var(--foreground)]">{registeredEmail}</strong>.
          </p>
          <Button
            type="button"
            className="mt-8 w-full"
            variant="amber"
            disabled={dashBusy}
            onClick={() => {
              setDashBusy(true);
              router.replace("/school/dashboard");
            }}
          >
            {dashBusy ? <FiLoader className="animate-spin" size={16} aria-hidden /> : null}
            {dashBusy ? "Opening…" : "Go to School Dashboard"}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "otp") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex justify-center">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-[var(--amber-50)] text-[var(--amber-600)]">
              <MdSchool size={28} />
            </span>
          </div>
          <h1 className="text-center font-heading text-2xl font-bold text-[var(--blue-900)]">Verify your email</h1>
          <p className="mt-2 text-center text-sm text-[var(--gray-400)]">
            Enter the code we sent to complete school registration.
          </p>

          <form className="mt-8 space-y-4" onSubmit={otpForm.handleSubmit(onVerifyOtp)}>
            <div className="rounded-lg border border-[var(--amber-400)]/40 bg-[var(--amber-50)] px-4 py-3 text-sm text-[var(--amber-800)]">
              Code sent to <strong>{registeredEmail}</strong>
            </div>
            {otpHint ? <p className="text-xs text-[var(--gray-400)]">{otpHint}</p> : null}

            <div>
              <label className="text-sm font-medium" htmlFor="sch-otp">
                Verification code
              </label>
              <input
                id="sch-otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="● ● ● ● ● ●"
                className={cn(
                  inputClass(Boolean(otpForm.formState.errors.otp)),
                  "text-center text-xl font-bold tracking-[0.35em]",
                )}
                {...otpForm.register("otp", {
                  setValueAs: (v) => String(v ?? "").replace(/\D/g, ""),
                })}
              />
              {otpForm.formState.errors.otp && (
                <p className="mt-1 text-xs text-[#A32D2D]">{otpForm.formState.errors.otp.message}</p>
              )}
            </div>

            {otpError ? (
              <p className="rounded-lg bg-[#FCE8E8] px-3 py-2 text-xs text-[#A32D2D]" role="alert">
                {otpError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting ? <FiLoader className="animate-spin" size={16} aria-hidden /> : null}
              {otpForm.formState.isSubmitting ? "Verifying…" : "Verify email"}
            </Button>

            <button
              type="button"
              className="w-full text-center text-xs font-semibold text-[var(--blue-600)] hover:underline"
              disabled={otpForm.formState.isSubmitting}
              onClick={() => {
                setPhase("wizard");
                setStep(3);
                setOtpHint("");
                setOtpError("");
              }}
            >
              ← Back to review
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-4 py-10 text-[var(--foreground)]">
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-xl font-bold text-[var(--blue-600)]">
            SchoolSetu
          </Link>
          <div className="mt-6 flex justify-center">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-[var(--blue-50)] text-[var(--blue-600)]">
              <MdSchool size={28} />
            </span>
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-[var(--blue-900)] md:text-3xl">
            Register your school
          </h1>
          <p className="mt-2 text-sm text-[var(--gray-400)]">
            Create an owner account and submit your listing for verification.
          </p>
        </header>

        {/* Progress */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between text-xs font-medium text-[var(--gray-400)]">
            <span>
              Step {step} of {STEPS.length}:{" "}
              <span className="text-[var(--blue-600)]">{STEPS[step - 1]}</span>
            </span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--gray-100)]">
            <div
              className="h-full bg-[var(--blue-600)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-3 hidden justify-between sm:flex">
            {STEPS.map((label, i) => (
              <span
                key={label}
                className={cn(
                  "text-xs font-medium",
                  i + 1 <= step ? "text-[var(--blue-600)]" : "text-[var(--gray-400)]",
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--gray-100)] bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={form.handleSubmit(onRegisterSubmit)}>
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-heading text-lg font-bold text-[var(--blue-900)]">Account details</h2>
                <div>
                  <label className="text-sm font-medium" htmlFor="rs-owner">
                    Owner name
                  </label>
                  <input id="rs-owner" className={inputClass(Boolean(form.formState.errors.ownerName))} {...form.register("ownerName")} />
                  {form.formState.errors.ownerName && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.ownerName.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="rs-email">
                    Email
                  </label>
                  <input
                    id="rs-email"
                    type="email"
                    autoComplete="email"
                    className={inputClass(Boolean(form.formState.errors.email))}
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="rs-phone">
                    Phone
                  </label>
                  <div className="mt-1 flex">
                    <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[var(--gray-100)] bg-[var(--gray-50)] px-3 text-sm text-[#55534e]">
                      +91
                    </span>
                    <input
                      id="rs-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      className={cn(inputClass(Boolean(form.formState.errors.phone)), "rounded-l-none")}
                      {...form.register("phone")}
                    />
                  </div>
                  {form.formState.errors.phone && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="rs-pw">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="rs-pw"
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      className={cn(inputClass(Boolean(form.formState.errors.password)), "pr-11")}
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] hover:text-[var(--foreground)]"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor="rs-pw2">
                    Confirm password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="rs-pw2"
                      type={showPw2 ? "text" : "password"}
                      autoComplete="new-password"
                      className={cn(inputClass(Boolean(form.formState.errors.confirmPassword)), "pr-11")}
                      {...form.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)] hover:text-[var(--foreground)]"
                      onClick={() => setShowPw2((v) => !v)}
                      aria-label={showPw2 ? "Hide password" : "Show password"}
                    >
                      {showPw2 ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-heading text-lg font-bold text-[var(--blue-900)]">School basics</h2>
                <div>
                  <label className="text-sm font-medium" htmlFor="rs-school">
                    School name
                  </label>
                  <input id="rs-school" className={inputClass(Boolean(form.formState.errors.schoolName))} {...form.register("schoolName")} />
                  {form.formState.errors.schoolName && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.schoolName.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor="rs-type">
                      School type
                    </label>
                    <select id="rs-type" className={inputClass(Boolean(form.formState.errors.schoolType))} {...form.register("schoolType")}>
                      {SCHOOL_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.schoolType && (
                      <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.schoolType.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="rs-year">
                      Established year
                    </label>
                    <input
                      id="rs-year"
                      type="number"
                      min={1800}
                      max={YEAR_MAX}
                      placeholder={`e.g. ${YEAR_MAX - 10}`}
                      className={inputClass(Boolean(form.formState.errors.establishedYear))}
                      {...form.register("establishedYear")}
                    />
                    {form.formState.errors.establishedYear && (
                      <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.establishedYear.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium" htmlFor="rs-principal">
                    Principal name
                  </label>
                  <input
                    id="rs-principal"
                    className={inputClass(Boolean(form.formState.errors.principalName))}
                    {...form.register("principalName")}
                  />
                  {form.formState.errors.principalName && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.principalName.message}</p>
                  )}
                </div>

                <fieldset>
                  <legend className="text-sm font-medium">Board affiliation</legend>
                  <p className="mt-1 text-xs text-[var(--gray-400)]">Select all that apply (Others is optional).</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {BOARD_OPTIONS.map((b) => {
                      const selected = values.boards.includes(b);
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => toggleBoard(b)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                            selected
                              ? "border-[var(--blue-600)] bg-[var(--blue-50)] text-[var(--blue-900)]"
                              : "border-[var(--gray-100)] bg-white text-[#55534e] hover:border-[var(--blue-600)]/40",
                          )}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.boards && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.boards.message}</p>
                  )}
                </fieldset>

                <div>
                  <label className="text-sm font-medium" htmlFor="rs-street">
                    Street address
                  </label>
                  <input id="rs-street" className={inputClass(Boolean(form.formState.errors.street))} {...form.register("street")} />
                  {form.formState.errors.street && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.street.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium" htmlFor="rs-city">
                      City
                    </label>
                    <input id="rs-city" className={inputClass(Boolean(form.formState.errors.city))} {...form.register("city")} />
                    {form.formState.errors.city && (
                      <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="rs-state">
                      State
                    </label>
                    <input id="rs-state" className={inputClass(Boolean(form.formState.errors.state))} {...form.register("state")} />
                    {form.formState.errors.state && (
                      <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:max-w-[220px]">
                  <label className="text-sm font-medium" htmlFor="rs-pin">
                    Pincode
                  </label>
                  <input
                    id="rs-pin"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="211001"
                    className={inputClass(Boolean(form.formState.errors.pincode))}
                    {...form.register("pincode", {
                      setValueAs: (v) => String(v ?? "").replace(/\D/g, "").slice(0, 6),
                    })}
                  />
                  {form.formState.errors.pincode && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.pincode.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium" htmlFor="rs-web">
                    Website <span className="font-normal text-[var(--gray-400)]">(optional)</span>
                  </label>
                  <input
                    id="rs-web"
                    type="url"
                    placeholder="https://www.yourschool.edu"
                    className={inputClass(Boolean(form.formState.errors.website))}
                    {...form.register("website")}
                  />
                  {form.formState.errors.website && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.website.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium" htmlFor="rs-desc">
                    Description
                  </label>
                  <textarea
                    id="rs-desc"
                    rows={4}
                    placeholder="Brief overview for parents browsing SchoolSetu."
                    className={cn(inputClass(Boolean(form.formState.errors.description)), "resize-none")}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="mt-1 text-xs text-[#A32D2D]">{form.formState.errors.description.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-heading text-lg font-bold text-[var(--blue-900)]">Review & submit</h2>
                <div className="space-y-4 text-sm">
                  <section className="rounded-xl border border-[var(--gray-100)] bg-[var(--gray-50,#fafafa)] p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--gray-400)]">Account</h3>
                    <dl className="mt-3 space-y-2 text-[#55534e]">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Owner</dt>
                        <dd className="text-right font-medium text-[var(--foreground)]">{values.ownerName}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Email</dt>
                        <dd className="break-all text-right font-medium text-[var(--foreground)]">{values.email}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Phone</dt>
                        <dd className="text-right font-medium text-[var(--foreground)]">
                          +91 {values.phone.replace(/\D/g, "")}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Password</dt>
                        <dd className="text-right font-medium tracking-widest text-[var(--foreground)]">••••••••</dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-xl border border-[var(--gray-100)] bg-[var(--gray-50,#fafafa)] p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--gray-400)]">School</h3>
                    <dl className="mt-3 space-y-2 text-[#55534e]">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Name</dt>
                        <dd className="text-right font-medium text-[var(--foreground)]">{values.schoolName}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Type</dt>
                        <dd className="text-right font-medium text-[var(--foreground)]">{values.schoolType}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Established</dt>
                        <dd className="text-right font-medium text-[var(--foreground)]">{values.establishedYear}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Principal</dt>
                        <dd className="text-right font-medium text-[var(--foreground)]">{values.principalName}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Boards</dt>
                        <dd className="text-right font-medium text-[var(--foreground)]">{values.boards.join(", ")}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--gray-400)]">Address</dt>
                        <dd className="max-w-[60%] text-right font-medium text-[var(--foreground)]">
                          {values.street}, {values.city}, {values.state} — {values.pincode}
                        </dd>
                      </div>
                      {values.website.trim().length > 0 ? (
                        <div className="flex justify-between gap-4">
                          <dt className="text-[var(--gray-400)]">Website</dt>
                          <dd className="break-all text-right font-medium text-[var(--blue-600)]">{values.website.trim()}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-[var(--gray-400)]">Description</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-[var(--foreground)]">{values.description}</dd>
                      </div>
                    </dl>
                  </section>
                </div>

                {submitError ? (
                  <p className="rounded-lg bg-[#FCE8E8] px-3 py-2 text-sm text-[#A32D2D]" role="alert">
                    {submitError}
                  </p>
                ) : null}

                <p className="text-xs text-[var(--gray-400)]">
                  By submitting, you confirm the details are accurate. We&apos;ll email a verification code next.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--gray-100)] pt-6">
              <Button type="button" variant="outline" disabled={step === 1 || stepBusy || form.formState.isSubmitting} onClick={handleBack}>
                <FiChevronLeft size={16} aria-hidden />
                Back
              </Button>

              {step < 3 ? (
                <Button type="button" disabled={stepBusy} onClick={() => void handleNext()}>
                  {stepBusy ? <FiLoader className="animate-spin" size={16} aria-hidden /> : null}
                  {stepBusy ? "Please wait…" : "Next"}
                  {!stepBusy ? <FiChevronRight size={16} aria-hidden /> : null}
                </Button>
              ) : (
                <Button type="submit" variant="amber" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <FiLoader className="animate-spin" size={16} aria-hidden /> : null}
                  {form.formState.isSubmitting ? "Submitting…" : "Submit registration"}
                  {!form.formState.isSubmitting ? <FiArrowRight size={16} aria-hidden /> : null}
                </Button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--gray-400)]">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[var(--blue-600)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

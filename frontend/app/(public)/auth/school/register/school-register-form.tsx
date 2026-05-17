"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCheck, FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

// ── Types ────────────────────────────────────────────────────────────────────

type City = { id: string; name: string; slug: string };
type Board = { id: string; name: string; slug: string };

type FacilityKey =
  | "library"
  | "labs"
  | "smartClassroom"
  | "hostel"
  | "transport"
  | "wifi"
  | "cctv"
  | "playground"
  | "cafeteria"
  | "gym"
  | "auditorium"
  | "swimmingPool";

type FormState = {
  // Step 1
  name: string;
  city: string;
  board: string;
  type: string;
  medium: string;
  establishedYear: string;
  // Step 2
  principalName: string;
  phone: string;
  whatsapp: string;
  email: string;
  addressLine: string;
  pincode: string;
  // Step 3
  monthlyFee: string;
  admissionFee: string;
  classesFrom: string;
  classesTo: string;
  admissionOpen: boolean;
  // Step 4
  facilities: Record<FacilityKey, boolean>;
};

const FACILITIES: { key: FacilityKey; label: string }[] = [
  { key: "library", label: "Library" },
  { key: "labs", label: "Science Lab" },
  { key: "smartClassroom", label: "Computer Lab / Smart Class" },
  { key: "hostel", label: "Hostel" },
  { key: "transport", label: "Transport" },
  { key: "wifi", label: "WiFi" },
  { key: "cctv", label: "CCTV" },
  { key: "playground", label: "Playground / Sports" },
  { key: "cafeteria", label: "Cafeteria" },
  { key: "gym", label: "Gym" },
  { key: "auditorium", label: "Auditorium" },
  { key: "swimmingPool", label: "Swimming Pool" },
];

const SCHOOL_TYPES = ["Private", "Government", "Aided"];
const MEDIUM_OPTIONS = ["English", "Hindi", "Hindi/English", "Other"];
const CLASS_OPTIONS_FROM = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI"];
const CLASS_OPTIONS_TO = ["V", "VIII", "X", "XII"];

// ── Per-step Zod schemas ─────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().trim().min(2, "School name must be at least 2 characters"),
  city: z.string().min(1, "City is required"),
  board: z.string().min(1, "Board is required"),
  type: z.string().min(1, "School type is required"),
  medium: z.string().min(1, "Medium is required"),
  establishedYear: z
    .string()
    .optional()
    .refine(
      (v) => !v || (/^\d{4}$/.test(v) && Number(v) >= 1800 && Number(v) <= new Date().getFullYear()),
      { message: "Enter a valid 4-digit year" }
    ),
});

const step2Schema = z.object({
  principalName: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Phone must be at least 10 digits"),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.replace(/\D/g, "").length >= 10, "WhatsApp must be at least 10 digits"),
  email: z.union([z.string().email("Invalid email"), z.literal("")]).optional(),
  addressLine: z.string().trim().optional(),
  pincode: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d{6}$/.test(v), "Pincode must be 6 digits"),
});

const step3Schema = z.object({
  monthlyFee: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+$/.test(v), "Must be a number"),
  admissionFee: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+$/.test(v), "Must be a number"),
  classesFrom: z.string().min(1, "Required"),
  classesTo: z.string().min(1, "Required"),
});

// ── Component ────────────────────────────────────────────────────────────────

const STEPS = ["Basic Info", "Contact", "Fees", "Facilities"];

const initialState: FormState = {
  name: "",
  city: "",
  board: "",
  type: "Private",
  medium: "English",
  establishedYear: "",
  principalName: "",
  phone: "",
  whatsapp: "",
  email: "",
  addressLine: "",
  pincode: "",
  monthlyFee: "",
  admissionFee: "",
  classesFrom: "Nursery",
  classesTo: "XII",
  admissionOpen: true,
  facilities: FACILITIES.reduce(
    (acc, f) => ({ ...acc, [f.key]: false }),
    {} as Record<FacilityKey, boolean>,
  ),
};

export function SchoolRegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [cities, setCities] = useState<City[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  // Auth gate — only school/admin can register
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth/login");
    }
  }, [router]);

  // Fetch cities + boards
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [citiesRes, boardsRes] = await Promise.all([
          fetch(`${API_URL}/api/cities`),
          fetch(`${API_URL}/api/boards`),
        ]);
        if (cancelled) return;
        if (citiesRes.ok) {
          const json = (await citiesRes.json()) as { data: City[] };
          setCities(json.data);
        }
        if (boardsRes.ok) {
          const json = (await boardsRes.json()) as { data: Board[] };
          setBoards(json.data);
        }
      } catch (err) {
        console.error("[Register] failed to load taxonomy", err);
      } finally {
        if (!cancelled) setTaxonomyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function toggleFacility(key: FacilityKey) {
    setForm((prev) => ({
      ...prev,
      facilities: { ...prev.facilities, [key]: !prev.facilities[key] },
    }));
  }

  function validateCurrentStep(): boolean {
    let result;
    if (step === 1) result = step1Schema.safeParse(form);
    else if (step === 2) result = step2Schema.safeParse(form);
    else if (step === 3) result = step3Schema.safeParse(form);
    else return true;

    if (result.success) {
      setErrors({});
      return true;
    }

    const next: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!next[path]) next[path] = issue.message;
    }
    setErrors(next);
    return false;
  }

  function handleNext() {
    if (validateCurrentStep()) setStep((s) => Math.min(s + 1, STEPS.length));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const payload = {
        name: form.name,
        city: form.city,
        board: form.board,
        type: form.type,
        medium: form.medium,
        establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
        principalName: form.principalName || undefined,
        phone: form.phone,
        whatsapp: form.whatsapp || undefined,
        email: form.email || undefined,
        addressLine: form.addressLine || undefined,
        pincode: form.pincode || undefined,
        monthlyFee: form.monthlyFee ? Number(form.monthlyFee) : undefined,
        admissionFee: form.admissionFee ? Number(form.admissionFee) : undefined,
        classesFrom: form.classesFrom,
        classesTo: form.classesTo,
        admissionOpen: form.admissionOpen,
        facilities: form.facilities,
      };

      const res = await fetch(`${API_URL}/api/schools`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(data.error ?? "Failed to register school. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/school/dashboard"), 2500);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mt-8 rounded-2xl border border-[#C0DD97] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3DE]">
            <FiCheck size={32} className="text-[#3B6D11]" />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-bold text-[#042C53]">
            Registration Submitted!
          </h2>
          <p className="mt-3 text-[#55534e]">
            Admin will verify within <strong>1&ndash;2 business days</strong>. Your school will be
            published once approved.
          </p>
          <p className="mt-2 text-sm text-[#888780]">Redirecting to your dashboard&hellip;</p>
        </div>
      </div>
    );
  }

  // ── Form UI ────────────────────────────────────────────────────────────────

  const inputClass =
    "w-full rounded-lg border border-[#D3D1C7] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]/20";
  const labelClass = "mb-1 block text-sm font-medium text-[#2C2C2A]";
  const errorClass = "mt-1 text-xs text-[#A32D2D]";
  const progressPct = (step / STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-heading text-2xl font-bold text-[#0C447C]"
        >
          SchoolSetu
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-bold text-[#042C53]">
          Register Your School
        </h1>
        <p className="mt-2 text-sm text-[#888780]">
          List your school in 4 quick steps. Free verification within 1&ndash;2 business days.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-[#888780]">
          <span>
            Step {step} of {STEPS.length}: <span className="text-[#185FA5]">{STEPS[step - 1]}</span>
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#D3D1C7]">
          <div
            className="h-full bg-[#185FA5] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-3 hidden justify-between sm:flex">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`text-xs font-medium ${i + 1 <= step ? "text-[#185FA5]" : "text-[#888780]"}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="mt-6 rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm sm:p-8">

        {/* ── Step 1 ─────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-[#0C447C]">Basic Information</h2>

            <div>
              <label className={labelClass}>
                School Name <span className="text-[#A32D2D]">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Sunrise Public School"
                className={inputClass}
              />
              {errors.name && <p className={errorClass}>{errors.name}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  City <span className="text-[#A32D2D]">*</span>
                </label>
                <select
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={inputClass}
                  disabled={taxonomyLoading}
                >
                  <option value="">{taxonomyLoading ? "Loading…" : "Select city"}</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.city && <p className={errorClass}>{errors.city}</p>}
              </div>

              <div>
                <label className={labelClass}>
                  Board <span className="text-[#A32D2D]">*</span>
                </label>
                <select
                  value={form.board}
                  onChange={(e) => update("board", e.target.value)}
                  className={inputClass}
                  disabled={taxonomyLoading}
                >
                  <option value="">{taxonomyLoading ? "Loading…" : "Select board"}</option>
                  {boards.map((b) => (
                    <option key={b.id} value={b.slug}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.board && <p className={errorClass}>{errors.board}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>School Type</label>
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                  className={inputClass}
                >
                  {SCHOOL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.type && <p className={errorClass}>{errors.type}</p>}
              </div>

              <div>
                <label className={labelClass}>Medium of Instruction</label>
                <select
                  value={form.medium}
                  onChange={(e) => update("medium", e.target.value)}
                  className={inputClass}
                >
                  {MEDIUM_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {errors.medium && <p className={errorClass}>{errors.medium}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Established Year</label>
              <input
                type="number"
                value={form.establishedYear}
                onChange={(e) => update("establishedYear", e.target.value)}
                placeholder="e.g. 2005"
                min={1800}
                max={new Date().getFullYear()}
                className={inputClass}
              />
              {errors.establishedYear && <p className={errorClass}>{errors.establishedYear}</p>}
            </div>
          </div>
        )}

        {/* ── Step 2 ─────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-[#0C447C]">Contact &amp; Address</h2>

            <div>
              <label className={labelClass}>Principal Name</label>
              <input
                type="text"
                value={form.principalName}
                onChange={(e) => update("principalName", e.target.value)}
                placeholder="e.g. Dr. R. Kumar"
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Phone Number <span className="text-[#A32D2D]">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  placeholder="Same as phone if blank"
                  className={inputClass}
                />
                {errors.whatsapp && <p className={errorClass}>{errors.whatsapp}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="admin@school.example"
                className={inputClass}
              />
              {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>

            <div>
              <label className={labelClass}>Full Address</label>
              <textarea
                rows={2}
                value={form.addressLine}
                onChange={(e) => update("addressLine", e.target.value)}
                placeholder="Street, Area, Landmark"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="sm:max-w-[200px]">
              <label className={labelClass}>Pincode</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
                placeholder="211001"
                className={inputClass}
              />
              {errors.pincode && <p className={errorClass}>{errors.pincode}</p>}
            </div>
          </div>
        )}

        {/* ── Step 3 ─────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-[#0C447C]">Fees &amp; Academics</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Monthly Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.monthlyFee}
                  onChange={(e) => update("monthlyFee", e.target.value)}
                  placeholder="e.g. 3500"
                  className={inputClass}
                />
                {errors.monthlyFee && <p className={errorClass}>{errors.monthlyFee}</p>}
              </div>
              <div>
                <label className={labelClass}>Admission Fee (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.admissionFee}
                  onChange={(e) => update("admissionFee", e.target.value)}
                  placeholder="e.g. 15000"
                  className={inputClass}
                />
                {errors.admissionFee && <p className={errorClass}>{errors.admissionFee}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Classes From <span className="text-[#A32D2D]">*</span>
                </label>
                <select
                  value={form.classesFrom}
                  onChange={(e) => update("classesFrom", e.target.value)}
                  className={inputClass}
                >
                  {CLASS_OPTIONS_FROM.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.classesFrom && <p className={errorClass}>{errors.classesFrom}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  Classes To <span className="text-[#A32D2D]">*</span>
                </label>
                <select
                  value={form.classesTo}
                  onChange={(e) => update("classesTo", e.target.value)}
                  className={inputClass}
                >
                  {CLASS_OPTIONS_TO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.classesTo && <p className={errorClass}>{errors.classesTo}</p>}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#D3D1C7] bg-[#F1EFE8] px-4 py-3">
              <input
                type="checkbox"
                checked={form.admissionOpen}
                onChange={(e) => update("admissionOpen", e.target.checked)}
                className="h-4 w-4 accent-[#185FA5]"
              />
              <div>
                <p className="text-sm font-semibold text-[#2C2C2A]">Admission Open</p>
                <p className="text-xs text-[#888780]">
                  Show &ldquo;Admissions Open&rdquo; badge to parents browsing your listing.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* ── Step 4 ─────────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-heading text-xl font-bold text-[#0C447C]">Facilities</h2>
            <p className="text-sm text-[#55534e]">
              Tick all facilities your school offers. Only ticked facilities will appear on your listing.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {FACILITIES.map(({ key, label }) => {
                const checked = form.facilities[key];
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                      checked
                        ? "border-[#3B6D11] bg-[#EAF3DE] text-[#3B6D11]"
                        : "border-[#D3D1C7] bg-white text-[#2C2C2A] hover:border-[#185FA5]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFacility(key)}
                      className="h-4 w-4 accent-[#185FA5]"
                    />
                    <span className="font-medium">{label}</span>
                  </label>
                );
              })}
            </div>

            {submitError && (
              <p className="rounded-lg bg-[#FCE8E8] px-4 py-3 text-sm font-medium text-[#A32D2D]">
                {submitError}
              </p>
            )}
          </div>
        )}

        {/* ── Action buttons ─────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-between border-t border-[#D3D1C7] pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || submitting}
          >
            <FiChevronLeft size={16} />
            Back
          </Button>

          {step < STEPS.length ? (
            <Button type="button" onClick={handleNext}>
              Next
              <FiChevronRight size={16} />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={submitting} variant="amber">
              {submitting ? <FiLoader className="animate-spin" size={16} /> : null}
              {submitting ? "Submitting…" : "Submit Registration"}
            </Button>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-[#888780]">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-[#185FA5] hover:underline">
          Sign in →
        </Link>
      </p>
    </div>
  );
}

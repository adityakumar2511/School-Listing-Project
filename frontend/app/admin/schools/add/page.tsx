"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLoader } from "react-icons/fi";
import { MdCheckCircle } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/schools-api";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

const CITY_OPTIONS = [
  { label: "Prayagraj", value: "prayagraj" },
  { label: "Lucknow", value: "lucknow" },
  { label: "Kanpur", value: "kanpur" },
  { label: "Jhansi", value: "jhansi" },
  { label: "Banda", value: "banda" },
];

const BOARD_OPTIONS = [
  { label: "CBSE", value: "cbse" },
  { label: "ICSE", value: "icse" },
  { label: "UP Board", value: "up_board" },
  { label: "IB", value: "ib" },
  { label: "IGCSE", value: "igcse" },
];

type FormState = {
  name: string;
  city: string;
  board: string;
  phone: string;
  address: string;
  monthlyFee: string;
};

export default function AdminAddSchoolPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    city: "prayagraj",
    board: "cbse",
    phone: "",
    address: "",
    monthlyFee: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: string };
      if (payload.role !== "admin") router.replace("/");
    } catch {
      router.replace("/auth/login");
    }
  }, [router]);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError("");
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("School name is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/schools`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          name: form.name.trim(),
          city: form.city,
          board: form.board,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
          monthlyFee: form.monthlyFee ? Number(form.monthlyFee) : undefined,
        }),
      });
      const data = (await res.json()) as { data?: { id: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to create school. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/admin"), 1500);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#D3D1C7] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5]/20";
  const labelClass = "block text-sm font-medium text-[#2C2C2A]";

  return (
    <div className="container-shell py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-[#888780]">
        <Link href="/admin" className="hover:text-[#185FA5]">Admin</Link>
        <span>›</span>
        <Link href="/admin" className="hover:text-[#185FA5]">Schools</Link>
        <span>›</span>
        <span className="font-medium text-[#2C2C2A]">Add School</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold text-[#042C53]">Add a School</h1>
      <p className="mt-2 text-sm text-[#888780]">
        Schools created here are published immediately with status <strong>approved</strong>.
      </p>

      <div className="mt-8 max-w-xl">
        {success ? (
          <div className="flex items-center gap-3 rounded-xl border border-[#C0DD97] bg-[#EAF3DE] px-5 py-4">
            <MdCheckCircle className="shrink-0 text-2xl text-[#3B6D11]" aria-hidden />
            <p className="font-semibold text-[#3B6D11]">School created successfully! Redirecting…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm">

            {/* Name */}
            <div>
              <label className={labelClass}>
                School Name <span className="text-[#A32D2D]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sunrise Public School"
                value={form.name}
                onChange={set("name")}
                className={`mt-1 ${inputClass}`}
                required
              />
            </div>

            {/* City + Board */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <select value={form.city} onChange={set("city")} className={`mt-1 ${inputClass}`}>
                  {CITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Board</label>
                <select value={form.board} onChange={set("board")} className={`mt-1 ${inputClass}`}>
                  {BOARD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={set("phone")}
                className={`mt-1 ${inputClass}`}
              />
            </div>

            {/* Address */}
            <div>
              <label className={labelClass}>Address</label>
              <textarea
                rows={2}
                placeholder="Street, Area, City"
                value={form.address}
                onChange={set("address")}
                className={`mt-1 ${inputClass} resize-none`}
              />
            </div>

            {/* Monthly Fee */}
            <div>
              <label className={labelClass}>Monthly Fee (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 3500"
                value={form.monthlyFee}
                onChange={set("monthlyFee")}
                className={`mt-1 ${inputClass}`}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-[#FCE8E8] px-4 py-3 text-sm font-medium text-[#A32D2D]">{error}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? <FiLoader className="animate-spin" size={16} /> : null}
                {loading ? "Creating…" : "Create School"}
              </Button>
              <Link href="/admin">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

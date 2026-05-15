"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { authHeaders } from "@/lib/auth-token";
import { API_URL } from "@/lib/schools-api";
import { cn } from "@/lib/utils";

const inquirySchema = z.object({
  parentName: z.string().trim().min(2, "Enter parent name"),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit phone"),
  childName: z.string().trim().min(2, "Enter student name"),
  classApplying: z.string().min(1, "Select a class"),
  message: z.string().max(500).optional()
});

type InquiryValues = z.infer<typeof inquirySchema>;

const classOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));

type InquiryFormProps = {
  schoolId: string;
  schoolName: string;
  onSuccess?: () => void;
};

function fieldClass(hasError?: boolean) {
  return cn(
    "rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-[#185FA5]",
    hasError ? "border-[#A32D2D]" : "border-[#D3D1C7]"
  );
}

export function InquiryForm({ schoolId, schoolName, onSuccess }: InquiryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
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
          message: values.message
        })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not send inquiry");
      }
    },
    onSuccess: () => {
      reset();
      onSuccess?.();
    }
  });

  if (mutation.isSuccess) {
    return (
      <div className="rounded-xl border border-[#D3D1C7] bg-[#EAF3DE] p-5 text-center">
        <p className="font-heading text-lg font-bold text-[#3B6D11]">Inquiry sent!</p>
        <p className="mt-2 text-sm text-[#2C2C2A]">{schoolName} will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="grid gap-3 rounded-xl border border-[#D3D1C7] bg-white p-5"
    >
      <div>
        <p className="font-heading text-xl font-bold text-[#0C447C]">Request admission call</p>
        <p className="mt-1 text-sm text-[#55534e]">
          Inquiry for {schoolName}. Sign in with Phone OTP before submitting if you are not logged in.
        </p>
      </div>

      <label className="grid gap-1 text-sm font-medium">
        Parent name
        <input className={fieldClass(Boolean(errors.parentName))} {...register("parentName")} />
        {errors.parentName ? <span className="text-xs text-[#A32D2D]">{errors.parentName.message}</span> : null}
      </label>

      <label className="grid gap-1 text-sm font-medium">
        Phone
        <div className="flex">
          <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[#D3D1C7] bg-[#F1EFE8] px-3 text-sm text-[#55534e]">
            +91
          </span>
          <input
            inputMode="numeric"
            maxLength={10}
            className={cn(fieldClass(Boolean(errors.phone)), "w-full rounded-l-none")}
            {...register("phone")}
          />
        </div>
        {errors.phone ? <span className="text-xs text-[#A32D2D]">{errors.phone.message}</span> : null}
      </label>

      <label className="grid gap-1 text-sm font-medium">
        Child name
        <input className={fieldClass(Boolean(errors.childName))} {...register("childName")} />
        {errors.childName ? <span className="text-xs text-[#A32D2D]">{errors.childName.message}</span> : null}
      </label>

      <label className="grid gap-1 text-sm font-medium">
        Class applying
        <select className={fieldClass(Boolean(errors.classApplying))} {...register("classApplying")}>
          <option value="">Select class</option>
          {classOptions.map((value) => (
            <option key={value} value={value}>
              Class {value}
            </option>
          ))}
        </select>
        {errors.classApplying ? <span className="text-xs text-[#A32D2D]">{errors.classApplying.message}</span> : null}
      </label>

      <label className="grid gap-1 text-sm font-medium">
        Message (optional)
        <textarea rows={3} className={fieldClass()} {...register("message")} />
      </label>

      {mutation.isError ? (
        <p className="rounded-lg bg-[#FCEBEB] px-3 py-2 text-sm text-[#A32D2D]">
          {(mutation.error as Error).message}
        </p>
      ) : null}

      <Button type="submit" variant="amber" disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
        Submit Inquiry
      </Button>
    </form>
  );
}

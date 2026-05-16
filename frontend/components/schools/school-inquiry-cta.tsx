"use client";

import { useState } from "react";
import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  schoolId: string;
  schoolName: string;
  phone: string;
  whatsapp: string;
  board: string;
  monthlyFee: number;
  classesFrom: string;
  classesTo: string;
  admissionOpen: boolean;
  admissionClasses: string[];
};

export function SchoolInquiryCta({
  schoolId,
  schoolName,
  phone,
  whatsapp,
  board,
  monthlyFee,
  classesFrom,
  classesTo,
  admissionOpen,
  admissionClasses,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const digits = whatsapp.replace(/\D/g, "");

  return (
    <div className="space-y-4 rounded-xl border border-[#D3D1C7] bg-white p-5">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-lg font-semibold text-[#0C447C]">
            Send Admission Inquiry
          </h3>
          <Badge tone={admissionOpen ? "success" : "danger"}>
            {admissionOpen ? "Open" : "Closed"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-[#888780]">
          Free inquiry — the school will contact you within 24 hours
        </p>
      </div>

      {/* Quick info */}
      <div className="space-y-1.5 border-y border-[#D3D1C7] py-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-[#888780]">Monthly Fee</span>
          <span className="font-medium">
            {monthlyFee > 0 ? `₹${monthlyFee.toLocaleString("en-IN")}` : "On request"}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#888780]">Board</span>
          <span className="font-medium">{board}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#888780]">Classes</span>
          <span className="font-medium">
            {classesFrom} – {classesTo}
          </span>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={`https://wa.me/${digits}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5d]"
      >
        💬 Inquire on WhatsApp
      </a>

      {/* Divider */}
      <div className="flex items-center gap-3 text-xs text-[#888780]">
        <div className="flex-1 border-t border-[#D3D1C7]" />
        or
        <div className="flex-1 border-t border-[#D3D1C7]" />
      </div>

      {/* Inline form toggle */}
      {showForm ? (
        <InquiryForm
          schoolId={schoolId}
          schoolName={schoolName}
          admissionClasses={admissionClasses}
          onSuccess={() => setShowForm(false)}
        />
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
          📝 Fill Inquiry Form
        </Button>
      )}

      {/* Phone link */}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="block text-center text-xs text-[#888780] hover:text-[#185FA5]"
        >
          📞 {phone}
        </a>
      )}
    </div>
  );
}

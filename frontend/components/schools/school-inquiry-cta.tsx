"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SchoolInquiryCtaProps = {
  schoolId: string;
  schoolName: string;
};

export function SchoolInquiryCta({ schoolId, schoolName }: SchoolInquiryCtaProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <Button type="button" variant="amber" className="w-full shadow-lg" onClick={() => setIsOpen(true)}>
          Send Admission Inquiry
        </Button>
      </div>

      <div className="grid content-start gap-4">
        <Card>
          <p className="font-heading text-xl font-bold text-[#0C447C]">Admissions</p>
          <p className="mt-2 text-sm leading-6 text-[#55534e]">
            Send your details to request a callback from the school admission team.
          </p>
          <Button type="button" variant="amber" className="mt-5 hidden w-full md:inline-flex" onClick={() => setIsOpen(true)}>
            Send Admission Inquiry
          </Button>
        </Card>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <InquiryModal schoolId={schoolId} schoolName={schoolName} onClose={() => setIsOpen(false)} />
        </div>
      ) : null}
    </>
  );
}

function InquiryModal({
  schoolId,
  schoolName,
  onClose
}: {
  schoolId: string;
  schoolName: string;
  onClose: () => void;
}) {
  return (
    <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-2 shadow-xl">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D3D1C7] bg-white text-[#55534e]"
        aria-label="Close"
      >
        <X size={17} />
      </button>
      <InquiryForm schoolId={schoolId} schoolName={schoolName} onSuccess={onClose} />
    </div>
  );
}

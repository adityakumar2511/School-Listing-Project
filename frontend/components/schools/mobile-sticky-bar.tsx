"use client";

type Props = {
  phone: string;
  whatsapp: string;
};

export function MobileStickyBar({ phone, whatsapp }: Props) {
  const digits = whatsapp.replace(/\D/g, "");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-3 border-t border-[#D3D1C7] bg-white p-4 md:hidden">
      <a
        href={`tel:${phone}`}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#D3D1C7] py-2.5 text-sm font-semibold text-[#2C2C2A]"
      >
        📞 Call
      </a>
      <a
        href={`https://wa.me/${digits}`}
        target="_blank"
        rel="noreferrer"
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#3B6D11] bg-[#EAF3DE] py-2.5 text-sm font-semibold text-[#3B6D11]"
      >
        💬 WhatsApp
      </a>
      <a
        href="#inquiry"
        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#EF9F27] py-2.5 text-sm font-semibold text-white"
      >
        📝 Inquiry
      </a>
    </div>
  );
}

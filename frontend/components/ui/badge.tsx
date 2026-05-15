import { cn } from "@/lib/utils";

type BadgeTone = "blue" | "amber" | "success" | "neutral" | "danger";

const tones: Record<BadgeTone, string> = {
  blue: "bg-[#E6F1FB] text-[#185FA5]",
  amber: "bg-[#FAEEDA] text-[#854F0B]",
  success: "bg-[#EAF3DE] text-[#3B6D11]",
  neutral: "bg-white text-[#2C2C2A] border border-[#D3D1C7]",
  danger: "bg-[#FCEBEB] text-[#A32D2D]"
};

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

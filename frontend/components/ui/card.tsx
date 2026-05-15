import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[12px] border border-[#D3D1C7] bg-white p-5", className)} {...props} />;
}

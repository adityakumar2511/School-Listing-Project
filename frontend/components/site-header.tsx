import Link from "next/link";
import { GraduationCap, Menu, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/schools", label: "Schools" },
  { href: "/ai-recommend", label: "AI Recommend" },
  { href: "/compare", label: "Compare" },
  { href: "/for-schools", label: "For Schools" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#D3D1C7] bg-white/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl font-bold text-[#0C447C]">
          <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-[#E6F1FB] text-[#185FA5]">
            <GraduationCap size={24} />
          </span>
          SchoolSetu
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#2C2C2A] md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#185FA5]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="amber" className="hidden sm:inline-flex">
            <Link href="/auth/login">
              <MessageCircle size={17} />
              Login
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="md:hidden" aria-label="Open navigation">
            <Menu size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}

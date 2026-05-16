import Link from "next/link";
import { TARGET_CITIES } from "@/data/schools";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#D3D1C7] bg-white">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-heading text-lg font-bold text-[#0C447C]">SchoolSetu</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#55534e]">
            Free school discovery and admission lead generation for parents and schools across emerging Indian cities.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Popular cities</p>
          <div className="mt-3 grid gap-2 text-sm text-[#55534e]">
            {TARGET_CITIES.map((city) => (
              <Link key={city.slug} href={`/schools/${city.slug}`} className="hover:text-[#185FA5]">
                Schools in {city.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <div className="mt-3 grid gap-2 text-sm text-[#55534e]">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

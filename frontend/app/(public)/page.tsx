import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BrainCircuit, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SchoolCard } from "@/components/schools/school-card";
import { SearchPanel } from "@/components/schools/search-panel";
import { targetCities } from "@/data/schools";
import { fetchCities, fetchSchoolsList } from "@/lib/schools-api";

const categoryLinks = [
  { label: "CBSE Schools", href: "/schools/board/cbse" },
  { label: "IIT/NEET Schools", href: "/schools/category/iit-neet" },
  { label: "Hostel Schools", href: "/schools/category/hostel" },
  { label: "Sports Schools", href: "/schools/category/sports" }
];

const blogPlaceholders = [
  { title: "How to choose a school in Tier-2 cities", excerpt: "Board, fees, commute, and safety checklist for parents." },
  { title: "Admission documents parents forget", excerpt: "TC, Aadhaar, report cards, and hostel medical forms." },
  { title: "CBSE vs ICSE in Uttar Pradesh", excerpt: "What changes for Class 9–12 and competitive exams." }
];

export default async function HomePage() {
  const [cities, featuredResponse, admissionResponse] = await Promise.all([
    fetchCities(),
    fetchSchoolsList({ featured: true, limit: 4 }).catch(() => ({
      data: [],
      pagination: { page: 1, limit: 4, total: 0, totalPages: 0 }
    })),
    fetchSchoolsList({ admissionOpen: true, limit: 4 }).catch(() => ({
      data: [],
      pagination: { page: 1, limit: 4, total: 0, totalPages: 0 }
    }))
  ]);

  const cityCounts = new Map(cities.map((city) => [city.slug, city._count?.schools ?? 0]));

  return (
    <>
      <section className="bg-white">
        <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.08fr_0.92fr] md:py-16">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#E6F1FB] px-4 py-2 text-sm font-semibold text-[#185FA5]">
              <Sparkles size={16} />
              Admissions, search, and verified leads
            </span>
            <h1 className="font-heading text-4xl font-bold leading-tight text-[#042C53] md:text-5xl">
              Find the right school for your child in your city.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#55534e]">
              Compare fees, boards, facilities, hostel options, and admission status across trusted schools in Prayagraj, Banda, Kanpur, Jhansi, and Lucknow.
            </p>
            <div className="mt-8">
              <Suspense>
                <SearchPanel />
              </Suspense>
            </div>
          </div>
          <div className="grid content-center gap-4">
            <Card className="bg-[#042C53] text-white">
              <p className="font-heading text-2xl font-bold">WhatsApp-first admission discovery</p>
              <p className="mt-3 text-sm leading-6 text-[#E6F1FB]">
                Parents can call, WhatsApp, compare, or send OTP-verified inquiries. Schools get a clean lead pipeline and free digital profile.
              </p>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <ShieldCheck className="text-[#185FA5]" />
                <p className="mt-3 text-sm font-semibold">Moderated school data</p>
              </Card>
              <Card>
                <BrainCircuit className="text-[#EF9F27]" />
                <p className="mt-3 text-sm font-semibold">AI recommendations</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-12">
        <h2 className="font-heading text-3xl font-bold text-[#0C447C]">Popular cities</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {targetCities.map((city) => (
            <Link
              key={city.slug}
              href={`/schools/${city.slug}`}
              className="rounded-xl border border-[#D3D1C7] bg-white p-4 font-semibold hover:border-[#85B7EB]"
            >
              <MapPin className="mb-3 text-[#185FA5]" size={20} />
              Schools in {city.name}
              <span className="mt-2 block text-xs font-normal text-[#55534e]">
                {cityCounts.get(city.slug) ?? 0} schools
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-shell py-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-heading text-3xl font-bold text-[#0C447C]">Featured schools</h2>
          <Button asChild variant="ghost">
            <Link href="/schools">
              View all
              <ArrowRight size={17} />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {featuredResponse.data.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      </section>

      <section className="container-shell py-8">
        <h2 className="font-heading text-3xl font-bold text-[#0C447C]">Admission open now</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {admissionResponse.data.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      </section>

      <section className="container-shell py-8">
        <h2 className="font-heading text-3xl font-bold text-[#0C447C]">Browse by category</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {categoryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-[#D3D1C7] bg-white px-4 py-2 text-sm font-semibold text-[#185FA5] hover:bg-[#E6F1FB]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-shell py-12">
        <div className="rounded-xl bg-[#FAEEDA] p-6 md:flex md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="font-heading text-3xl font-bold text-[#633806]">Let AI find the perfect school</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#633806]">
              Ask about budget, board preference, hostel, sports, IIT/NEET goals, and commute priorities.
            </p>
          </div>
          <Button asChild className="mt-5 md:mt-0" variant="amber">
            <Link href="/ai-recommend">Start AI recommendation</Link>
          </Button>
        </div>
      </section>

      <section className="container-shell py-8">
        <h2 className="font-heading text-3xl font-bold text-[#0C447C]">Parent guides</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {blogPlaceholders.map((post) => (
            <Card key={post.title}>
              <p className="font-semibold text-[#0C447C]">{post.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#55534e]">{post.excerpt}</p>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

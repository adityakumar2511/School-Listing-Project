import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  FiSearch,
  FiGitMerge,
  FiMessageSquare,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";
import { MdSchool, MdScience } from "react-icons/md";
import {
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { getFeaturedSchools, getAdmissionOpenSchools } from "@/data/schools";
import { SchoolCard } from "@/components/schools/school-card";
import { HeroSearch } from "@/components/schools/hero-search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { normalizeSchool } from "@/lib/schools-api";

export const metadata: Metadata = {
  title: "Schools in Prayagraj 2025 — Fees, Admission & Comparison | SchoolSetu",
  description:
    "Browse CBSE, ICSE, and UP Board schools in Prayagraj. Compare fees, explore hostel options, and send a direct WhatsApp inquiry — completely free for parents.",
  keywords:
    "schools in prayagraj, cbse schools prayagraj, school admission prayagraj 2025, best schools allahabad, up board schools prayagraj",
  openGraph: {
    title: "Schools in Prayagraj — SchoolSetu",
    description: "Verified schools in Prayagraj — fees, board, and hostel options all in one place.",
    url: "https://schoolsetu.in",
    type: "website",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const featuredSchools = getFeaturedSchools().map(normalizeSchool);
const admissionOpenSchools = getAdmissionOpenSchools().map(normalizeSchool);

const heroStats = [
  { value: "15+", label: "Schools Listed" },
  { value: "4", label: "Boards Available" },
  { value: "₹200", label: "Lowest Monthly Fee" },
  { value: "Free", label: "For Parents Always" },
];

const quickFilters = [
  { label: "CBSE Schools", href: "/schools/prayagraj?board=CBSE" },
  { label: "Hostel Available", href: "/schools/category/hostel" },
  { label: "IIT/NEET Focus", href: "/schools/category/iit-neet" },
];

const trustItems = [
  "Verified school data",
  "WhatsApp-first inquiry",
  "OTP-verified leads",
  "Free forever for parents",
];

const categories: { icon: ReactNode; title: string; count: string; href: string }[] = [
  {
    icon: <MdSchool size={28} color="#185FA5" />,
    title: "CBSE Schools",
    count: "3 schools in Prayagraj",
    href: "/schools/prayagraj?board=CBSE",
  },
  {
    icon: <HiOutlineOfficeBuilding size={28} color="#185FA5" />,
    title: "Hostel / Boarding",
    count: "2 schools with hostel",
    href: "/schools/category/hostel",
  },
  {
    icon: <MdScience size={28} color="#185FA5" />,
    title: "IIT / NEET Focus",
    count: "2 schools",
    href: "/schools/category/iit-neet",
  },
  {
    icon: <HiOutlineUserGroup size={28} color="#185FA5" />,
    title: "Girls Schools",
    count: "1 school in Prayagraj",
    href: "/schools/category/girls",
  },
  {
    icon: <HiOutlineCurrencyRupee size={28} color="#185FA5" />,
    title: "Budget Schools",
    count: "Under ₹500/month",
    href: "/schools/prayagraj?feeRange=budget",
  },
  {
    icon: <HiOutlineDocumentText size={28} color="#185FA5" />,
    title: "UP Board Schools",
    count: "1 school",
    href: "/schools/prayagraj?board=UP+Board",
  },
];

const howItWorksSteps: { icon: ReactNode; bgColor: string; title: string; desc: string }[] = [
  {
    icon: <FiSearch size={24} color="#185FA5" />,
    bgColor: "bg-[#E6F1FB]",
    title: "Search Schools",
    desc: "Filter by city, board, fees, and facilities",
  },
  {
    icon: <FiGitMerge size={24} color="#185FA5" />,
    bgColor: "bg-[#E6F1FB]",
    title: "Compare Schools",
    desc: "Compare up to 3 schools side by side — fees, facilities, and board",
  },
  {
    icon: <FiMessageSquare size={24} color="#185FA5" />,
    bgColor: "bg-[#EAF3DE]",
    title: "Send a WhatsApp or Inquiry",
    desc: "Call directly or send an OTP-verified inquiry — completely free",
  },
];

const guides: {
  tag: string;
  tagColor: "blue" | "amber" | "success";
  title: string;
  desc: string;
  readTime: string;
  href: string;
}[] = [
  {
    tag: "Admission Guide",
    tagColor: "blue",
    title: "School Admission in Prayagraj 2025 — Complete Guide",
    desc: "Documents, timeline, and fees — everything first-time applicants need to know",
    readTime: "5 min read",
    href: "/blog/prayagraj-school-admission-guide-2025",
  },
  {
    tag: "Board Comparison",
    tagColor: "amber",
    title: "CBSE vs UP Board — An Honest Comparison for Prayagraj Parents",
    desc: "Curriculum, exam pattern, and college admissions — a detailed comparison of both boards",
    readTime: "4 min read",
    href: "/blog/cbse-vs-up-board-prayagraj",
  },
  {
    tag: "School Reviews",
    tagColor: "success",
    title: "Top Hostel Schools in Prayagraj — Fees and Facilities",
    desc: "Safe, affordable, and academically strong boarding schools",
    readTime: "6 min read",
    href: "/blog/top-hostel-schools-prayagraj",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Section 1: Hero ── */}
      <section className="bg-white">
        <div className="container-shell grid min-h-[88vh] items-center gap-10 py-12 md:grid-cols-[3fr_2fr] md:py-16">
          {/* Left column */}
          <div>
            <Badge tone="blue">
              <HiOutlineAcademicCap className="mr-1 inline" size={13} />
              Prayagraj's #1 School Directory
            </Badge>

            <h1 className="mt-5 font-heading text-4xl font-bold leading-tight text-[#2C2C2A] md:text-5xl">
              Find the Right School
              <br />
              for Your Child
              <br />
              <span className="text-[#185FA5]">in Prayagraj</span>
            </h1>

            <p className="mt-4 max-w-lg text-lg leading-relaxed text-[#888780]">
              Compare fees, board, hostel, and transport — all in one place.
              <br />
              Send an OTP-verified inquiry and the school will call you back.
            </p>

            <div className="mt-8">
              <HeroSearch />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickFilters.map((f) => (
                <Link
                  key={f.href}
                  href={f.href}
                  className="rounded-full border border-[#D3D1C7] px-4 py-1.5 text-sm transition-colors hover:border-[#185FA5] hover:text-[#185FA5]"
                >
                  {f.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/schools/prayagraj">
                  Browse Schools <FiArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="amber">
                <Link href="/ai-recommend">
                  Get AI Recommendations <FiArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right column — stat cards */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border-l-4 border-[#185FA5] bg-white p-5 shadow-sm"
              >
                <p className="font-heading text-3xl font-bold text-[#185FA5]">{stat.value}</p>
                <p className="mt-1 text-sm text-[#888780]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 2: Trust Bar ── */}
      <section className="bg-[#185FA5] py-4">
        <div className="container-shell flex flex-wrap justify-center gap-8 md:gap-16">
          {trustItems.map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-sm font-medium text-white">
              <FiCheck size={14} />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Section 3: Featured Schools ── */}
      <section className="bg-[#F1EFE8] py-16">
        <div className="container-shell">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-[#0C447C]">
                Featured Schools in Prayagraj
              </h2>
              <p className="mt-1 text-[#888780]">
                Verified listings with fees, board, and facilities
              </p>
            </div>
            <Link
              href="/schools/prayagraj"
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-[#185FA5] hover:underline"
            >
              View All Schools <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredSchools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Browse by Category ── */}
      <section className="bg-white py-16">
        <div className="container-shell">
          <h2 className="font-heading text-3xl font-bold text-[#0C447C]">
            What Are You Looking For?
          </h2>
          <p className="mt-1 text-[#888780]">
            Choose a category to find matching schools in Prayagraj
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {categories.map((cat) => (
              <Link key={cat.href} href={cat.href}>
                <div className="group cursor-pointer rounded-xl border border-[#D3D1C7] bg-white p-5 transition-all duration-200 hover:border-[#185FA5] hover:shadow-md">
                  <div className="mb-3">{cat.icon}</div>
                  <h3 className="font-heading text-base font-semibold text-[#2C2C2A]">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#888780]">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: How It Works ── */}
      <section className="bg-[#F1EFE8] py-16">
        <div className="container-shell">
          <h2 className="font-heading text-3xl font-bold text-[#0C447C]">
            How Easy It Is to Send an Admission Inquiry
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {howItWorksSteps.map((step, i) => (
              <div key={i}>
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${step.bgColor}`}
                >
                  {step.icon}
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-[#2C2C2A]">
                  {step.title}
                </h3>
                <p className="mt-1 leading-relaxed text-[#888780]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: AI CTA ── */}
      <section className="bg-gradient-to-br from-[#0C447C] to-[#185FA5] py-16">
        <div className="container-shell flex flex-col items-center justify-between gap-8 md:flex-row">
          <div>
            <h2 className="font-heading text-3xl font-bold text-white">
              Your AI School Advisor — Free of Charge
            </h2>
            <p className="mt-3 max-w-lg text-blue-200">
              Share your budget, board preference, hostel needs, and goals.
              <br />
              The AI will suggest the best matching schools in Prayagraj.
            </p>
            <Button asChild variant="amber" className="mt-6">
              <Link href="/ai-recommend">
                Get Free AI Recommendations <FiArrowRight size={16} />
              </Link>
            </Button>
          </div>

          {/* Mock chat UI */}
          <div className="hidden max-w-xs rounded-xl bg-white/10 p-4 md:block">
            <div className="mb-3 rounded-lg bg-white/20 p-3 text-sm text-white">
              Class 9, CBSE, budget ₹4,000, hostel needed
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-[#EF9F27] p-3 text-sm text-[#2C2C2A]">
              <FiCheck size={14} className="flex-shrink-0" />
              2 schools found in Prayagraj matching your needs
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Admission Open ── */}
      <section className="bg-white py-16">
        <div className="container-shell">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-3xl font-bold text-[#0C447C]">
                Admissions Open Now — 2025-26
              </h2>
              <Badge tone="success">Live</Badge>
            </div>
            <Link
              href="/schools/prayagraj"
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-[#185FA5] hover:underline"
            >
              All Schools <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {admissionOpenSchools.map((s) => (
              <SchoolCard key={s.id} school={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 8: Blog Guides ── */}
      <section className="bg-[#F1EFE8] py-16">
        <div className="container-shell">
          <h2 className="font-heading text-3xl font-bold text-[#0C447C]">
            Helpful Guides for Parents
          </h2>
          <p className="mt-1 text-[#888780]">Articles to help you make informed school admission decisions</p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {guides.map((article) => (
              <Link key={article.href} href={article.href}>
                <article className="h-full rounded-xl border border-[#D3D1C7] bg-white p-6 transition-shadow hover:shadow-md">
                  <Badge tone={article.tagColor}>{article.tag}</Badge>
                  <h3 className="mt-3 font-heading text-base font-semibold leading-snug text-[#2C2C2A]">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#888780]">{article.desc}</p>
                  <p className="mt-4 flex items-center gap-1 text-xs text-[#888780]">
                    <FiArrowRight size={12} />
                    {article.readTime}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

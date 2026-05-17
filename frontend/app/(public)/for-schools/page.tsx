import type { Metadata } from "next";
import Link from "next/link";
import {
  FiCheck,
  FiArrowRight,
  FiUsers,
  FiBarChart2,
  FiMessageSquare,
  FiShield,
  FiStar,
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { HiOutlineCurrencyRupee, HiOutlineDocumentText } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "List Your School Free — SchoolSetu",
  description:
    "Register your Prayagraj school on SchoolSetu. Free listing, verified parent inquiries, WhatsApp-first leads.",
  openGraph: {
    title: "List Your School Free on SchoolSetu",
    description:
      "Reach parents actively searching for schools in Prayagraj. Free listing, verified inquiries only.",
    url: "https://schoolsetu.in/for-schools",
    type: "website",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: <FiUsers size={28} color="#185FA5" />,
    title: "Verified Parent Inquiries",
    desc: "Every inquiry is OTP-verified. No spam, no fake leads — only genuine parents.",
  },
  {
    icon: <HiOutlineCurrencyRupee size={28} color="#185FA5" />,
    title: "Completely Free to List",
    desc: "Basic listing is free forever. Pay only if you want featured placement.",
  },
  {
    icon: <FiMessageSquare size={28} color="#185FA5" />,
    title: "WhatsApp-First Contact",
    desc: "Parents contact you directly on WhatsApp. No middleman, no delay.",
  },
  {
    icon: <MdVerified size={28} color="#185FA5" />,
    title: "Verified Badge",
    desc: "Get a verified badge after document review. Builds trust with parents.",
  },
];

const steps = [
  {
    number: "1",
    icon: <HiOutlineDocumentText size={24} color="#185FA5" />,
    title: "Submit Your School",
    desc: "Fill the registration form with school details, fees, and facilities.",
  },
  {
    number: "2",
    icon: <FiShield size={24} color="#185FA5" />,
    title: "Verification",
    desc: "Our team reviews your submission within 48 hours and approves your listing.",
  },
  {
    number: "3",
    icon: <FiUsers size={24} color="#185FA5" />,
    title: "Start Receiving Inquiries",
    desc: "Parents find your school and send WhatsApp or form inquiries directly.",
  },
];

const included = [
  "School profile page with fees and facilities",
  "Listed in Prayagraj school directory",
  "Appear in parent search results",
  "WhatsApp inquiry button on your profile",
  "Basic analytics — inquiry count",
  "Admission status control (open/closed)",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForSchoolsPage() {
  return (
    <>
      {/* ── Section 1: Hero ── */}
      <section className="bg-white py-20">
        <div className="container-shell text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E6F1FB] px-4 py-1.5 text-sm font-medium text-[#185FA5]">
              <FiBarChart2 size={14} />
              15+ schools already listed in Prayagraj
            </div>
            <h1 className="font-heading text-3xl font-bold text-[#042C53] md:text-4xl">
              List Your School on SchoolSetu
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#55534e]">
              Reach parents actively searching for schools in Prayagraj.
              <br />
              Free to list, verified inquiries only.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/auth/school/register">
                  Register Your School <FiArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Already registered? Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Benefits ── */}
      <section className="bg-[#F1EFE8] py-16">
        <div className="container-shell">
          <h2 className="text-center font-heading text-3xl font-bold text-[#0C447C]">
            Why list on SchoolSetu?
          </h2>
          <p className="mt-2 text-center text-[#888780]">
            Everything a school needs to connect with the right parents
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#E6F1FB]">
                  {b.icon}
                </div>
                <h3 className="font-heading text-lg font-bold text-[#042C53]">{b.title}</h3>
                <p className="mt-2 leading-relaxed text-[#55534e]">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: How It Works ── */}
      <section className="bg-white py-16">
        <div className="container-shell">
          <h2 className="text-center font-heading text-3xl font-bold text-[#0C447C]">
            How to get listed
          </h2>
          <p className="mt-2 text-center text-[#888780]">3 simple steps — takes less than 10 minutes</p>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E6F1FB]">
                  {step.icon}
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#185FA5] text-xs font-bold text-white">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-[#042C53]">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-[#55534e]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: What's Included ── */}
      <section className="bg-[#F1EFE8] py-16">
        <div className="container-shell">
          <div className="mx-auto max-w-xl">
            <h2 className="text-center font-heading text-3xl font-bold text-[#0C447C]">
              {"What's included in free listing"}
            </h2>
            <p className="mt-2 text-center text-[#888780]">
              No credit card required — start immediately
            </p>
            <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#D3D1C7] bg-white p-6 shadow-sm">
              {included.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <FiCheck
                    size={18}
                    color="#185FA5"
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span className="text-[#2C2C2A]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Final CTA ── */}
      <section className="bg-[#185FA5] py-16 text-center text-white">
        <div className="container-shell">
          <h2 className="font-heading text-3xl font-bold text-white">
            Ready to reach more parents?
          </h2>
          <p className="mt-3 text-blue-200">
            Join 15+ schools already listed in Prayagraj
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-[#EF9F27] px-8 text-base font-semibold text-[#2C2C2A] hover:bg-[#d48e22]"
          >
            <Link href="/auth/school/register">
              Register Your School Free <FiArrowRight size={18} />
            </Link>
          </Button>
          <p className="mt-6 text-sm text-blue-200">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-white hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

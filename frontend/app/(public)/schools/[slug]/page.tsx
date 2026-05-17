import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FiCheck, FiMapPin, FiMessageCircle, FiPhone, FiSend } from "react-icons/fi";
import type { SchoolProfile } from "./school-profile-model";
import { SchoolDetailTabs } from "@/components/schools/school-detail-tabs";
import { SchoolInquiryCta } from "@/components/schools/school-inquiry-cta";
import { MobileStickyBar } from "@/components/schools/mobile-sticky-bar";
import { Badge } from "@/components/ui/badge";
import { mockSchools, TARGET_CITIES } from "@/data/schools";
import {
  fetchSchoolDetailBySlug,
  fetchSchoolsList,
  normalizeSchool,
  type NormalizedSchool,
} from "@/lib/schools-api";
import { formatCurrency } from "@/lib/utils";
import { SchoolsListingClient } from "../schools-listing-client";

export const revalidate = 3600;

// ─── Types ────────────────────────────────────────────────────────────────────

type DetailProps = { params: Promise<{ slug: string }> };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(value: string) {
  return value.toLowerCase().trim().replaceAll("_", "-").replaceAll(" ", "-");
}

function isCitySlug(slug: string) {
  return TARGET_CITIES.find((city) => city.slug === slug || slugify(city.name) === slug);
}

function readIsoDate(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

function toSchoolProfile(raw: unknown): SchoolProfile {
  const base = normalizeSchool(raw);
  const school = raw as Record<string, unknown>;
  const details = (school.details ?? {}) as Record<string, unknown>;
  const gallery = Array.isArray(school.gallery) ? school.gallery : [];
  const addressRaw =
    typeof school.address === "object" && school.address && !Array.isArray(school.address)
      ? (school.address as Record<string, unknown>)
      : {};
  const academicsRecord =
    school.academics && typeof school.academics === "object" && !Array.isArray(school.academics)
      ? (school.academics as Record<string, unknown>)
      : {};

  // Build facility map from raw SchoolFacilities object, or fall back to string array
  const facilityMap: Record<string, boolean> = {};
  if (school.facilities && typeof school.facilities === "object" && !Array.isArray(school.facilities)) {
    for (const [key, val] of Object.entries(school.facilities as Record<string, unknown>)) {
      if (key !== "schoolId") facilityMap[key] = Boolean(val);
    }
  } else {
    base.facilities.forEach((f) => {
      facilityMap[f.toLowerCase()] = true;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { medium: _m, ...baseRest } = base;

  const contentSections = Array.isArray(school.sections)
    ? (school.sections as Record<string, unknown>[]).map((s) => ({
        title: String(s.title ?? ""),
        content: String(s.content ?? ""),
        sectionType: String(s.sectionType ?? ""),
      }))
    : [];

  const achievements = Array.isArray(school.achievements)
    ? (school.achievements as Record<string, unknown>[]).map((a) => ({
        title: String(a.title ?? ""),
        year: typeof a.year === "number" ? a.year : undefined,
        description: typeof a.description === "string" ? a.description : undefined,
      }))
    : [];

  return {
    ...baseRest,
    area: typeof school.area === "string" ? school.area : base.city,
    pincode:
      typeof school.pincode === "string"
        ? school.pincode
        : typeof addressRaw.pincode === "string"
          ? addressRaw.pincode
          : "",
    classesFrom:
      typeof school.classesFrom === "string" ? school.classesFrom : (base.classes.split(" - ")[0] ?? ""),
    classesTo:
      typeof school.classesTo === "string" ? school.classesTo : (base.classes.split(" - ").at(-1) ?? ""),
    schoolType: typeof school.schoolType === "string" ? school.schoolType : base.type,
    gender: typeof school.gender === "string" ? school.gender : "Co-Educational",
    medium: Array.isArray(school.medium)
      ? (school.medium as string[])
      : typeof school.medium === "string"
        ? [school.medium]
        : ["English"],
    admissionClasses: Array.isArray(school.admissionClasses) ? (school.admissionClasses as string[]) : [],
    specialFocus: Array.isArray(school.specialFocus) ? (school.specialFocus as string[]) : [],
    isVerified: typeof school.isVerified === "boolean" ? school.isVerified : false,
    coverImage: typeof school.coverImage === "string" ? school.coverImage : undefined,
    tagline: typeof school.tagline === "string" ? school.tagline : undefined,
    principalName:
      typeof details.principalName === "string"
        ? details.principalName
        : typeof school.principalName === "string"
          ? school.principalName
          : undefined,
    facilityMap,
    galleryImages:
      gallery.length > 0
        ? gallery.map((item) => String((item as { cloudinaryUrl: string }).cloudinaryUrl))
        : [base.image],
    boardsOffered: [base.board],
    streams: Array.isArray(academicsRecord.streams)
      ? (academicsRecord.streams as unknown[]).map(String)
      : [],
    documentsRequired: Array.isArray(academicsRecord.documentsRequired)
      ? (academicsRecord.documentsRequired as unknown[]).map(String)
      : [],
    ageCriteria:
      typeof academicsRecord.ageCriteria === "string" ? academicsRecord.ageCriteria : undefined,
    admissionStart: readIsoDate(academicsRecord.admissionStart),
    admissionEnd: readIsoDate(academicsRecord.admissionEnd),
    contentSections,
    achievements,
  };
}

async function getSchoolBySlug(slug: string): Promise<SchoolProfile | null> {
  const rawDetail = await fetchSchoolDetailBySlug(slug);
  if (rawDetail) return toSchoolProfile(rawDetail);

  const school = mockSchools.find((item) => item.slug === slug);
  return school ? toSchoolProfile(school) : null;
}

// ─── Static params + Metadata ─────────────────────────────────────────────────

export async function generateStaticParams() {
  return [
    ...mockSchools.map((school) => ({ slug: school.slug })),
    ...TARGET_CITIES.map((city) => ({ slug: city.slug })),
  ];
}

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { slug } = await params;
  const city = isCitySlug(slug);

  if (city) {
    const count = mockSchools.filter((s) => s.citySlug === city.slug).length;
    return {
      title: `Schools in ${city.name} 2025 — CBSE, ICSE, UP Board | SchoolSetu`,
      description: `${count} verified schools in ${city.name}. Fees from ₹200 to ₹5,800/month. Filter by board, hostel, and transport to find the right school.`,
      openGraph: {
        title: `Schools in ${city.name} — SchoolSetu`,
        description: `${count} verified schools in ${city.name} — compare fees, boards, and facilities.`,
        url: `https://schoolsetu.in/schools/${city.slug}`,
        type: "website",
      },
    };
  }

  const mockSchool = mockSchools.find((s) => s.slug === slug);
  if (mockSchool) {
    return {
      title: `${mockSchool.name} — Fees, Admission 2025 | SchoolSetu`,
      description: `${mockSchool.name} in ${mockSchool.area}, ${mockSchool.city}. ${mockSchool.board} school. Monthly fee ₹${mockSchool.monthlyFee ?? "on request"}. ${mockSchool.admissionOpen ? "Admissions open" : "Admissions closed"} for 2025-26.`,
    };
  }

  const school = await getSchoolBySlug(slug);
  if (!school) return { title: "School not found" };

  return {
    title: `${school.name} — Fees, Admission 2025 | SchoolSetu`,
    description: `${school.name} in ${school.city}. ${school.board} school. Monthly fee ${school.monthlyFee ? `₹${school.monthlyFee}` : "on request"}. ${school.admissionOpen ? "Admissions open" : "Admissions closed"} for 2025-26.`,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function JsonLd({ school }: { school: SchoolProfile }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "School",
          name: school.name,
          description: school.description,
          address: {
            "@type": "PostalAddress",
            streetAddress: school.address,
            addressLocality: school.city,
            addressRegion: school.state,
            postalCode: school.pincode,
            addressCountry: "IN",
          },
          telephone: school.phone,
          url: `https://schoolsetu.in/schools/${school.slug}`,
          foundingDate: school.establishedYear ? String(school.establishedYear) : undefined,
          image: school.coverImage ?? school.image,
        }),
      }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SchoolOrCityPage({ params }: DetailProps) {
  const { slug } = await params;
  const city = isCitySlug(slug);

  // ── City page ──────────────────────────────────────────────────────────────

  if (city) {
    const citySchools = mockSchools.filter((s) => s.citySlug === city.slug);
    const boardsCount = new Set(citySchools.map((s) => s.board)).size;
    const fees = citySchools.map((s) => s.monthlyFee ?? 0).filter((f) => f > 0);
    const lowestFee = fees.length > 0 ? Math.min(...fees) : 0;
    const admissionOpenCount = citySchools.filter((s) => s.admissionOpen).length;
    const normalizedCitySchools = citySchools.map(normalizeSchool);

    const cityStats = [
      { value: String(citySchools.length), label: "Total Schools" },
      { value: String(boardsCount), label: "Boards Available" },
      { value: lowestFee > 0 ? formatCurrency(lowestFee) : "N/A", label: "Lowest Monthly Fee" },
      { value: String(admissionOpenCount), label: "Admission Open" },
    ];

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: `Schools in ${city.name}`,
              numberOfItems: normalizedCitySchools.length,
              itemListElement: normalizedCitySchools.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "School",
                  name: s.name,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: city.name,
                    addressRegion: "Uttar Pradesh",
                    addressCountry: "IN",
                  },
                  telephone: s.phone,
                  url: `https://schoolsetu.in/schools/${s.slug}`,
                },
              })),
            }),
          }}
        />

        <div className="bg-[#F1EFE8]">
          <div className="container-shell py-10">
            <nav className="mb-4 flex items-center gap-2 text-sm text-[#888780]">
              <Link href="/" className="hover:text-[#185FA5]">Home</Link>
              <span>›</span>
              <Link href="/schools" className="hover:text-[#185FA5]">Schools</Link>
              <span>›</span>
              <span className="font-medium text-[#2C2C2A]">{city.name}</span>
            </nav>

            <h1 className="font-heading text-4xl font-bold text-[#042C53]">
              Schools in {city.name} (2025-26 Admissions)
            </h1>

            <p className="mt-4 max-w-3xl leading-7 text-[#55534e]">
              {city.name === "Prayagraj"
                ? `Prayagraj — formerly known as Allahabad — is a major education hub in Uttar Pradesh. SchoolSetu lists ${citySchools.length} verified CBSE, ICSE, and UP Board schools here. Browse by fees, board, hostel, and facilities to find your ideal school.`
                : `${city.name} has ${citySchools.length} verified schools — CBSE, ICSE, and UP Board. Filter by fees, hostel, and facilities to find the right school for your child.`}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {cityStats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white p-4 shadow-sm">
                  <p className="font-heading text-2xl font-bold text-[#0C447C]">{stat.value}</p>
                  <p className="mt-1 text-sm text-[#888780]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-shell py-10">
          <Suspense
            fallback={
              <div className="h-96 animate-pulse rounded-[12px] border border-[#D3D1C7] bg-white" />
            }
          >
            <SchoolsListingClient defaultCitySlug={city.slug} />
          </Suspense>
        </div>
      </>
    );
  }

  // ── School detail page ─────────────────────────────────────────────────────

  const school = await getSchoolBySlug(slug);
  if (!school) notFound();

  const cityParam = school.cityId ?? school.citySlug;
  const nearbyListRes = cityParam
    ? await fetchSchoolsList({ city: cityParam, limit: 6, page: 1 })
    : ({ data: [] as NormalizedSchool[] } satisfies { data: NormalizedSchool[] });
  const nearbySchools = nearbyListRes.data.filter((s) => s.slug !== slug).slice(0, 3);

  const feeRows = (
    [
      school.admissionFee && school.admissionFee > 0
        ? { label: "Admission Fee", value: `₹${school.admissionFee.toLocaleString("en-IN")}` }
        : null,
      school.monthlyFee > 0
        ? { label: "Monthly Tuition", value: `₹${school.monthlyFee.toLocaleString("en-IN")}` }
        : null,
      school.annualFee > 0
        ? { label: "Annual Fee", value: `₹${school.annualFee.toLocaleString("en-IN")}` }
        : null,
      school.transportFee && school.transportFee > 0
        ? { label: "Transport Fee", value: `₹${school.transportFee.toLocaleString("en-IN")}/month` }
        : null,
      school.hostelFee && school.hostelFee > 0
        ? { label: "Hostel Fee", value: `₹${school.hostelFee.toLocaleString("en-IN")}/month` }
        : null,
    ] as (null | { label: string; value: string })[]
  ).filter(Boolean) as { label: string; value: string }[];

  const whatsappDigits = school.whatsapp.replace(/\D/g, "");

  return (
    <>
      <JsonLd school={school} />

      <div className="container-shell py-8 pb-24 md:pb-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* ── Main column ──────────────────────────────────────────────── */}
          <div className="min-w-0 flex-1 space-y-8">

            {/* Block 1 — School Header */}
            <div>
              <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#888780]">
                <Link href="/" className="hover:text-[#185FA5]">Home</Link>
                <span>›</span>
                <Link href="/schools" className="hover:text-[#185FA5]">Schools</Link>
                <span>›</span>
                <Link href={`/schools/${school.citySlug}`} className="hover:text-[#185FA5]">
                  {school.city}
                </Link>
                <span>›</span>
                <span className="font-medium text-[#2C2C2A]">{school.name}</span>
              </nav>

              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-[#E6F1FB] text-xl font-bold text-[#185FA5]">
                  {school.name[0]}
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge tone="blue">{school.board}</Badge>
                    <Badge tone="amber">{school.gender}</Badge>
                    {school.isVerified && (
                      <Badge tone="success">
                        <FiCheck size={12} className="mr-1 inline" /> Verified
                      </Badge>
                    )}
                  </div>
                  <h1 className="font-heading text-2xl font-bold leading-tight text-[#2C2C2A]">
                    {school.name}
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-[#888780]">
                    <FiMapPin size={13} />
                    {school.area}, {school.city} — {school.classesFrom} to {school.classesTo}
                  </p>
                </div>
              </div>
            </div>

            {/* Block 2 — Quick Stats Strip */}
            <div className="flex flex-wrap gap-x-8 gap-y-4 rounded-xl border border-[#D3D1C7] bg-white p-4">
              {[
                { label: "Board", value: school.board },
                { label: "Type", value: school.schoolType },
                { label: "Medium", value: school.medium.join(", ") },
                { label: "Since", value: school.establishedYear ? String(school.establishedYear) : "N/A" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#888780]">{item.label}</span>
                  <span className="text-sm font-semibold text-[#2C2C2A]">{item.value}</span>
                </div>
              ))}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#888780]">Status</span>
                <Badge tone={school.admissionOpen ? "success" : "danger"}>
                  {school.admissionOpen ? "Admission Open" : "Admission Closed"}
                </Badge>
              </div>
            </div>

            {/* Block 3 — Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {school.phone && (
                <a
                  href={`tel:${school.phone}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D3D1C7] px-5 py-2.5 text-sm font-semibold text-[#2C2C2A] transition-colors hover:border-[#185FA5] hover:text-[#185FA5]"
                >
                  <FiPhone size={15} /> Call School
                </a>
              )}
              {whatsappDigits && (
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#3B6D11] bg-[#EAF3DE] px-5 py-2.5 text-sm font-semibold text-[#3B6D11] transition-colors hover:bg-[#d4ebbb]"
                >
                  <FiMessageCircle size={15} /> WhatsApp
                </a>
              )}
              <a
                href="#inquiry"
                className="inline-flex items-center gap-2 rounded-lg bg-[#EF9F27] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d98e1e]"
              >
                <FiSend size={15} /> Send Inquiry
              </a>
            </div>

            <div className="rounded-xl border border-[#D3D1C7] bg-white p-6">
              <SchoolDetailTabs
                school={school}
                slug={slug}
                feeRows={feeRows}
                nearbySchools={nearbySchools}
              />
            </div>

          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <aside id="inquiry" className="w-full lg:w-80 xl:w-96">
            <div className="sticky top-4">
              <SchoolInquiryCta
                schoolId={school.id}
                schoolName={school.name}
                phone={school.phone}
                whatsapp={school.whatsapp}
                board={school.board}
                monthlyFee={school.monthlyFee}
                classesFrom={school.classesFrom}
                classesTo={school.classesTo}
                admissionOpen={school.admissionOpen}
                admissionClasses={school.admissionClasses}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bar — hidden on md+ */}
      <MobileStickyBar phone={school.phone} whatsapp={school.whatsapp} />
    </>
  );
}

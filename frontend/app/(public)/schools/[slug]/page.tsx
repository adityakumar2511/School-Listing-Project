import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Award,
  BookOpen,
  Building2,
  Bus,
  GraduationCap,
  Home,
  ImageIcon,
  MapPin,
  ShieldCheck,
  Trophy,
  Utensils
} from "lucide-react";
import { SchoolCard } from "@/components/schools/school-card";
import { SchoolInquiryCta } from "@/components/schools/school-inquiry-cta";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { schools as mockSchools, targetCities, type School } from "@/data/schools";
import { fetchSchoolBySlug, fetchSchoolsList, normalizeSchool } from "@/lib/schools-api";
import { formatCurrency } from "@/lib/utils";

type DetailProps = {
  params: Promise<{ slug: string }>;
};

type SchoolProfile = School & {
  principalName?: string;
  galleryImages: string[];
  boardsOffered: string[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const facilityIconMap = {
  transport: Bus,
  hostel: Home,
  sports: Trophy,
  playground: Trophy,
  library: BookOpen,
  labs: Award,
  canteen: Utensils,
  cafeteria: Utensils,
  cctv: ShieldCheck,
  "smart classroom": GraduationCap,
  auditorium: Building2
};

const facilityLabels: Record<string, string> = {
  library: "Library",
  labs: "Labs",
  hostel: "Hostel",
  transport: "Transport",
  smartClassroom: "Smart Classroom",
  wifi: "WiFi",
  cctv: "CCTV",
  gym: "Sports",
  swimmingPool: "Swimming Pool",
  playground: "Sports",
  auditorium: "Auditorium",
  cafeteria: "Canteen"
};

function slugify(value: string) {
  return value.toLowerCase().trim().replaceAll("_", "-").replaceAll(" ", "-");
}

function isCitySlug(slug: string) {
  return targetCities.find((city) => city.slug === slug || slugify(city.name) === slug);
}

function normalizeFacilities(rawFacilities: unknown): string[] {
  if (Array.isArray(rawFacilities)) {
    return rawFacilities.map(String);
  }

  if (rawFacilities && typeof rawFacilities === "object") {
    return Object.entries(rawFacilities as Record<string, unknown>)
      .filter(([key, value]) => key !== "schoolId" && value === true)
      .map(([key]) => facilityLabels[key] ?? key);
  }

  return [];
}

function toSchoolProfile(raw: unknown): SchoolProfile {
  const base = normalizeSchool(raw);
  const school = raw as Record<string, unknown>;
  const details = (school.details ?? {}) as Record<string, unknown>;
  const gallery = Array.isArray(school.gallery) ? school.gallery : [];
  const coverImage =
    base.image ??
    (gallery[0] as { cloudinaryUrl?: string } | undefined)?.cloudinaryUrl ??
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80";

  return {
    ...base,
    image: coverImage,
    principalName: typeof details.principalName === "string" ? details.principalName : undefined,
    galleryImages:
      gallery.length > 0
        ? gallery.map((item) => String((item as { cloudinaryUrl: string }).cloudinaryUrl))
        : [coverImage],
    boardsOffered: [base.board]
  };
}

async function getSchoolBySlug(slug: string): Promise<SchoolProfile | null> {
  const fromApi = await fetchSchoolBySlug(slug);
  if (fromApi) {
    return toSchoolProfile(fromApi.raw ?? fromApi);
  }

  const school = mockSchools.find((item) => item.slug === slug);
  return school ? toSchoolProfile(school) : null;
}

async function getSchoolsByCity(citySlug: string): Promise<SchoolProfile[]> {
  if (API_URL) {
    try {
      const response = await fetch(`${API_URL}/api/schools?city=${citySlug}&limit=24`, {
        next: {
          revalidate: 3600
        }
      });

      if (response.ok) {
        const payload = (await response.json()) as { data?: unknown[] };
        return (payload.data ?? []).map(toSchoolProfile);
      }
    } catch {
      // Fall through to mock data for local development.
    }
  }

  return mockSchools.filter((school) => school.citySlug === citySlug).map(toSchoolProfile);
}

export async function generateStaticParams() {
  return [...mockSchools.map((school) => ({ slug: school.slug })), ...targetCities.map((city) => ({ slug: city.slug }))];
}

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { slug } = await params;
  const city = isCitySlug(slug);

  if (city) {
    return {
      title: `Schools in ${city.name}`,
      description: `Compare schools, boards, fees, facilities, and admission options in ${city.name}.`
    };
  }

  const school = await getSchoolBySlug(slug);

  if (!school) {
    return {
      title: "School not found"
    };
  }

  return {
    title: school.name,
    description: school.description
  };
}

function SectionCard({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <h2 className="font-heading text-2xl font-bold text-[#0C447C]">{title}</h2>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

function FacilityIcon({ facility }: { facility: string }) {
  const Icon = facilityIconMap[facility.toLowerCase() as keyof typeof facilityIconMap] ?? ShieldCheck;

  return (
    <div className="rounded-[12px] border border-[#D3D1C7] bg-white p-4">
      <Icon className="text-[#185FA5]" size={22} />
      <p className="mt-3 text-sm font-semibold text-[#2C2C2A]">{facility}</p>
    </div>
  );
}

function JsonLd({ school }: { school: SchoolProfile }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "School",
    name: school.name,
    description: school.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: school.address,
      addressLocality: school.city,
      addressRegion: school.state,
      addressCountry: "IN"
    },
    telephone: school.phone,
    image: school.galleryImages,
    url: `https://schoolsetu.example/schools/${school.slug}`
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default async function SchoolOrCityPage({ params }: DetailProps) {
  const { slug } = await params;
  const city = isCitySlug(slug);

  if (city) {
    const citySchools = await getSchoolsByCity(city.slug);
    const startingFee = citySchools.length > 0 ? Math.min(...citySchools.map((school) => school.monthlyFee || 0)) : 0;

    return (
      <div className="container-shell py-10">
        <h1 className="font-heading text-4xl font-bold text-[#042C53]">Schools in {city.name}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#55534e]">
          Explore school profiles, boards, fee ranges, facilities, and admission options in {city.name}.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-3xl font-bold text-[#0C447C]">{citySchools.length}</p>
            <p className="text-sm text-[#55534e]">Listed schools</p>
          </Card>
          <Card>
            <p className="text-3xl font-bold text-[#0C447C]">{new Set(citySchools.map((school) => school.board)).size}</p>
            <p className="text-sm text-[#55534e]">Boards available</p>
          </Card>
          <Card>
            <p className="text-3xl font-bold text-[#0C447C]">{startingFee ? formatCurrency(startingFee) : "N/A"}</p>
            <p className="text-sm text-[#55534e]">Starting monthly fee</p>
          </Card>
        </div>

        {citySchools.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {citySchools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        ) : (
          <Card className="mt-8 text-center">
            <p className="font-heading text-xl font-bold text-[#0C447C]">No approved schools yet</p>
            <p className="mt-2 text-sm text-[#55534e]">Approved school profiles for {city.name} will appear here.</p>
          </Card>
        )}
      </div>
    );
  }

  const school = await getSchoolBySlug(slug);
  if (!school) notFound();

  const nearbyResponse = await fetchSchoolsList({ city: school.citySlug, limit: 4 }).catch(() => ({
    data: [],
    pagination: { page: 1, limit: 4, total: 0, totalPages: 0 }
  }));
  const nearbySchools = nearbyResponse.data.filter((item) => item.id !== school.id).slice(0, 3);
  const whatsappDigits = school.whatsapp.replace(/\D/g, "");

  return (
    <div>
      <JsonLd school={school} />

      <section className="bg-white">
        <div className="container-shell grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="relative aspect-[16/7] min-h-[260px] overflow-hidden rounded-[12px]">
              <Image src={school.image} alt={school.name} fill className="object-cover" priority sizes="100vw" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="blue">{school.board}</Badge>
              {school.isFeatured ? <Badge tone="amber">Featured</Badge> : null}
              <Badge tone={school.admissionOpen ? "success" : "danger"}>
                {school.admissionOpen ? "Admission Open" : "Admissions Closed"}
              </Badge>
            </div>
            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-[#042C53] md:text-5xl">{school.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-[#55534e]">
              <MapPin size={16} />
              {school.city}, {school.state}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {school.phone ? (
                <a href={`tel:${school.phone}`} className="rounded-lg bg-[#185FA5] px-4 py-2 text-sm font-semibold text-white">
                  Call
                </a>
              ) : null}
              {whatsappDigits ? (
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>

          <aside>
            <SchoolInquiryCta schoolId={school.id} schoolName={school.name} />
          </aside>
        </div>
      </section>

      <section className="container-shell grid gap-6 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Overview">
            <p className="leading-7 text-[#55534e]">{school.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[8px] bg-[#E6F1FB] p-4">
                <p className="text-xs font-medium text-[#185FA5]">Established</p>
                <p className="mt-1 font-heading text-xl font-bold text-[#042C53]">
                  {school.establishedYear || "N/A"}
                </p>
              </div>
              <div className="rounded-[8px] bg-[#FAEEDA] p-4">
                <p className="text-xs font-medium text-[#633806]">Principal</p>
                <p className="mt-1 font-heading text-xl font-bold text-[#633806]">
                  {school.principalName ?? "Not listed"}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Academics">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-[#D3D1C7] pb-3">
                <span className="text-[#55534e]">Boards offered</span>
                <strong className="text-right">{school.boardsOffered.join(", ")}</strong>
              </div>
              <div className="flex justify-between gap-4 border-b border-[#D3D1C7] pb-3">
                <span className="text-[#55534e]">Grades</span>
                <strong className="text-right">{school.classes}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#55534e]">Medium</span>
                <strong className="text-right">{school.medium}</strong>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionCard title="Fees">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-[#D3D1C7] pb-3">
                <span className="text-[#55534e]">Monthly fee</span>
                <strong>{school.monthlyFee ? formatCurrency(school.monthlyFee) : "N/A"}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#55534e]">Annual fee</span>
                <strong>{school.annualFee ? formatCurrency(school.annualFee) : "N/A"}</strong>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Facilities">
            {school.facilities.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {school.facilities.map((facility) => (
                  <FacilityIcon key={facility} facility={facility} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#55534e]">Facilities have not been listed yet.</p>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Gallery">
          {school.galleryImages.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {school.galleryImages.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-[#D3D1C7] bg-white">
                  <Image src={image} alt={`${school.name} gallery image ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 360px" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid min-h-48 place-items-center rounded-[12px] border border-[#D3D1C7] bg-white text-center">
              <div>
                <ImageIcon className="mx-auto text-[#185FA5]" />
                <p className="mt-3 text-sm text-[#55534e]">Gallery images will appear after school uploads are approved.</p>
              </div>
            </div>
          )}
        </SectionCard>

        {nearbySchools.length > 0 ? (
          <SectionCard title="Nearby schools">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {nearbySchools.map((item) => (
                <SchoolCard key={item.id} school={item} />
              ))}
            </div>
          </SectionCard>
        ) : null}
      </section>
    </div>
  );
}

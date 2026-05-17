"use client";

import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCamera,
  FiCoffee,
  FiHome,
  FiMapPin,
  FiMonitor,
  FiTruck,
  FiWifi,
} from "react-icons/fi";
import { MdMedicalServices, MdPool, MdSchool, MdSpa, MdSports, MdTheaters } from "react-icons/md";
import type { SchoolProfile } from "@/app/(public)/schools/[slug]/school-profile-model";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NormalizedSchool } from "@/lib/schools-api";
import { formatCurrency } from "@/lib/utils";

const FACILITY_DEFS: { key: string; label: string; Icon: IconType }[] = [
  { key: "hostel", label: "Hostel", Icon: FiHome },
  { key: "transport", label: "Transport", Icon: FiTruck },
  { key: "library", label: "Library", Icon: FiBookOpen },
  { key: "labs", label: "Science Labs", Icon: MdSchool },
  { key: "smartClassroom", label: "Smart Classroom", Icon: FiMonitor },
  { key: "wifi", label: "WiFi Campus", Icon: FiWifi },
  { key: "cctv", label: "CCTV Security", Icon: FiCamera },
  { key: "playground", label: "Sports Ground", Icon: MdSports },
  { key: "gym", label: "Gym", Icon: MdSpa },
  { key: "swimmingPool", label: "Swimming Pool", Icon: MdPool },
  { key: "auditorium", label: "Auditorium", Icon: MdTheaters },
  { key: "cafeteria", label: "Cafeteria", Icon: FiCoffee },
  { key: "medicalRoom", label: "Medical Room", Icon: MdMedicalServices },
];

const FOCUS_DESCRIPTIONS: Record<string, string> = {
  "IIT/NEET": "Integrated IIT/NEET preparation with daily practice tests and doubt sessions.",
  Sports: "State-level coaching and inter-school sports competitions.",
  Scholarship: "Merit-based scholarships for academically outstanding students.",
  Minority: "Special academic programs catering to minority community students.",
  Robotics: "Robotics and coding curriculum integrated from primary grades.",
  Arts: "Performing and visual arts programs with dedicated studio facilities.",
};

function NearbySchoolCard({ school }: { school: NormalizedSchool }) {
  return (
    <Link
      href={`/schools/${school.slug}`}
      className="flex items-center gap-3 rounded-xl border border-[#D3D1C7] bg-white p-4 transition-all hover:border-[#185FA5] hover:shadow-sm"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#E6F1FB] text-sm font-bold text-[#185FA5]">
        {school.name[0]}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#0C447C]">{school.name}</p>
        <p className="text-xs text-[#888780]">
          {school.board}
          {school.monthlyFee > 0 ? ` • ${formatCurrency(school.monthlyFee)}/mo` : ""}
        </p>
      </div>
    </Link>
  );
}

function hasEmbedCoords(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}

export type SchoolDetailTabsProps = {
  school: SchoolProfile;
  slug: string;
  feeRows: { label: string; value: string }[];
  nearbySchools: NormalizedSchool[];
};

export function SchoolDetailTabs({ school, slug, feeRows, nearbySchools }: SchoolDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full rounded-xl md:w-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="academics">Academics</TabsTrigger>
        <TabsTrigger value="fees">Fees</TabsTrigger>
        <TabsTrigger value="facilities">Facilities</TabsTrigger>
        <TabsTrigger value="gallery">Gallery</TabsTrigger>
        <TabsTrigger value="sections">Sections</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#0C447C]">About the School</h2>
          <p className="mt-3 leading-7 text-[#55534e]">{school.description}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[#888780]">Principal</p>
            <p className="mt-0.5 font-semibold text-[#2C2C2A]">{school.principalName ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-[#888780]">Established</p>
            <p className="mt-0.5 font-semibold text-[#2C2C2A]">
              {school.establishedYear ?? "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#888780]">Affiliation No.</p>
            <p className="mt-0.5 font-semibold text-[#2C2C2A]">{school.affiliationNo || "N/A"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-[#888780]">Address</p>
            <p className="mt-0.5 flex items-start gap-1 text-sm font-semibold text-[#2C2C2A]">
              <FiMapPin size={14} className="mt-0.5 shrink-0 text-[#888780]" aria-hidden />
              {school.address}
              {school.pincode ? ` — ${school.pincode}` : ""}
            </p>
          </div>
        </div>

        {hasEmbedCoords(school.lat, school.lng) && (
          <div className="border-t border-[#D3D1C7] pt-6">
            <h3 className="font-heading text-lg font-semibold text-[#0C447C]">Location Map</h3>
            <div className="mt-3 overflow-hidden rounded-xl border border-[#D3D1C7]">
              <iframe
                title={`Map for ${school.name}`}
                className="aspect-[16/9] min-h-[240px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${school.lat},${school.lng}&z=15&output=embed`}
              />
            </div>
          </div>
        )}

        {school.achievements.length > 0 && (
          <div className="border-t border-[#D3D1C7] pt-6">
            <h3 className="font-heading text-lg font-semibold text-[#0C447C]">Achievements</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#55534e]">
              {school.achievements.map((a) => (
                <li key={`${a.title}-${a.year ?? ""}`}>
                  <span className="font-semibold text-[#2C2C2A]">{a.title}</span>
                  {a.year ? <span className="text-[#888780]"> ({a.year})</span> : null}
                  {a.description ? <span> — {a.description}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        )}

        {nearbySchools.length > 0 && (
          <div className="border-t border-[#D3D1C7] pt-6">
            <h3 className="font-heading text-lg font-semibold text-[#0C447C]">
              More schools in {school.city}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {nearbySchools.map((nearby) => (
                <NearbySchoolCard key={nearby.id} school={nearby} />
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link
                href={`/schools/${school.citySlug}`}
                className="text-sm font-semibold text-[#185FA5] hover:underline"
              >
                View all schools in {school.city}
              </Link>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="academics" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[#888780]">Board</p>
            <p className="mt-0.5 font-semibold text-[#2C2C2A]">{school.board}</p>
          </div>
          <div>
            <p className="text-xs text-[#888780]">Classes Offered</p>
            <p className="mt-0.5 font-semibold text-[#2C2C2A]">
              {school.classesFrom} to {school.classesTo}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-[#888780]">Medium of Instruction</p>
            <p className="mt-0.5 font-semibold text-[#2C2C2A]">{school.medium.join(", ")}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-[#888780]">Admission Status</p>
            <Badge tone={school.admissionOpen ? "success" : "danger"} className="mt-1">
              {school.admissionOpen ? "Admission Open" : "Admission Closed"}
            </Badge>
          </div>
          {(school.admissionStart || school.admissionEnd) && (
            <div className="sm:col-span-2">
              <p className="text-xs text-[#888780]">Admission Window</p>
              <p className="mt-1 text-sm text-[#2C2C2A]">
                {school.admissionStart ? new Date(school.admissionStart).toLocaleDateString("en-IN") : "—"}
                {" — "}
                {school.admissionEnd ? new Date(school.admissionEnd).toLocaleDateString("en-IN") : "—"}
              </p>
            </div>
          )}
          {school.streams.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-xs text-[#888780] mb-2">Streams</p>
              <div className="flex flex-wrap gap-2">
                {school.streams.map((s) => (
                  <Badge key={s} tone="blue">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {school.documentsRequired.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-[#0C447C] mb-2">Documents Required</p>
              <ul className="list-inside list-disc text-sm text-[#55534e]">
                {school.documentsRequired.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {school.ageCriteria && (
            <div className="sm:col-span-2">
              <p className="text-xs text-[#888780]">Age Criteria</p>
              <p className="mt-1 text-sm text-[#55534e]">{school.ageCriteria}</p>
            </div>
          )}
          {school.admissionClasses.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold text-[#0C447C] mb-2">Classes Taking Admissions</p>
              <div className="flex flex-wrap gap-2">
                {school.admissionClasses.map((c) => (
                  <Badge key={c} tone="neutral">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {school.specialFocus.length > 0 && (
          <div className="border-t border-[#D3D1C7] pt-6">
            <h3 className="font-heading text-lg font-semibold text-[#0C447C]">Special Programs</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {school.specialFocus.map((focus) => (
                <Badge key={focus} tone="blue">
                  {focus}
                </Badge>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {school.specialFocus.map((focus) => {
                const desc = FOCUS_DESCRIPTIONS[focus];
                if (!desc) return null;
                return (
                  <div key={focus} className="rounded-lg bg-[#E6F1FB] px-4 py-3">
                    <p className="text-sm font-semibold text-[#0C447C]">{focus}</p>
                    <p className="mt-0.5 text-sm text-[#55534e]">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="fees">
        {feeRows.length > 0 ? (
          <>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#888780]">
              Fee Structure {new Date().getFullYear()}
            </p>
            <div className="overflow-hidden rounded-xl border border-[#D3D1C7]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#185FA5] text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Fee Type</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {feeRows.map((row, i) => (
                    <tr key={row.label} className={i % 2 === 1 ? "bg-[#F1EFE8]" : "bg-white"}>
                      <td className="px-4 py-3 text-sm text-[#55534e]">{row.label}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-[#2C2C2A]">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[#888780]">
              * Fees shown are approximate. Please confirm with the school.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-[#55534e]">
              Detailed fee breakdown is not available online for this listing yet.
            </p>
            <p className="mt-2 text-xs text-[#888780]">
              Please contact the school office or submit an inquiry — we&apos;ll notify the school to share the latest
              fee schedule.
            </p>
          </>
        )}
      </TabsContent>

      <TabsContent value="facilities">
        {(() => {
          const available = FACILITY_DEFS.filter((def) => Boolean(school.facilityMap[def.key]));
          return available.length === 0 ? (
            <p className="text-sm text-[#888780]">Facility details coming soon</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {available.map((def) => {
                const Icon = def.Icon;
                return (
                  <div
                    key={def.key}
                    className="flex items-center gap-3 rounded-lg border border-[#C0DD97] bg-[#EAF3DE] px-3 py-3 text-sm font-medium text-[#3B6D11]"
                  >
                    <Icon size={16} />
                    <span>{def.label}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </TabsContent>

      <TabsContent value="gallery">
        {school.galleryImages.length === 0 ? (
          <p className="text-sm text-[#888780]">Campus photos coming soon</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {school.galleryImages.map((src, i) => (
              <div key={`${slug}-g-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#D3D1C7]">
                <Image
                  src={src}
                  alt={`${school.name} campus ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="sections">
        {school.contentSections.length === 0 ? (
          <p className="text-sm text-[#888780]">
            Detailed section content is coming soon — check back after the school updates its profile.
          </p>
        ) : (
          <div className="space-y-8">
            {school.contentSections.map((section) => (
              <article key={`${section.sectionType}-${section.title}`}>
                <h3 className="font-heading text-lg font-bold text-[#0C447C]">{section.title}</h3>
                {section.sectionType ? (
                  <p className="mt-1 text-xs uppercase tracking-wide text-[#888780]">{section.sectionType}</p>
                ) : null}
                <div className="mt-3 max-w-none whitespace-pre-wrap text-sm leading-7 text-[#55534e]">
                  {section.content}
                </div>
              </article>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

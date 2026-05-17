// NormalizedSchool is the flat display shape produced by normalizeSchool.
// UI components (SchoolCard, AiChat, pages) all consume this type.
export type NormalizedSchool = {
  id: string
  name: string
  slug: string
  city: string
  citySlug: string
  cityId?: string
  state: string
  board: string
  type: string
  format: string
  medium: string
  description: string
  logo: string
  image: string
  phone: string
  whatsapp: string
  address: string
  establishedYear: number
  affiliationNo: string
  classes: string
  admissionOpen: boolean
  isFeatured: boolean
  monthlyFee: number
  annualFee: number
  admissionFee?: number
  transportFee?: number
  hostelFee?: number
  examFee?: number
  facilities: string[]
  categories: string[]
  lat: number
  lng: number
  gallery?: string[]
  principalName?: string
}

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SchoolsListResponse = {
  data: NormalizedSchool[];
  pagination: ApiPagination;
};

const facilityLabels: Record<string, string> = {
  library: "Library",
  labs: "Labs",
  hostel: "Hostel",
  transport: "Transport",
  smartClassroom: "Smart Classroom",
  wifi: "WiFi",
  cctv: "CCTV",
  gym: "Gym",
  swimmingPool: "Swimming Pool",
  playground: "Playground",
  auditorium: "Auditorium",
  cafeteria: "Canteen"
};

function slugify(value: string) {
  return value.toLowerCase().trim().replaceAll("_", "-").replaceAll(" ", "-");
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

type RawCity = { id?: string; name?: string; slug?: string; state?: { name?: string } };
type RawBoard = { name?: string; slug?: string };
type RawSection = { sectionType?: string };
type RawGallery = { cloudinaryUrl?: string };
type RawSchool = {
  id?: string | number;
  name?: string;
  slug?: string;
  city?: string | RawCity;
  state?: string;
  board?: string | RawBoard;
  type?: string;
  format?: string;
  medium?: string;
  description?: string;
  logo?: string;
  image?: string;
  gallery?: RawGallery[];
  phone?: string;
  whatsapp?: string;
  address?: string | { addressLine?: string; city?: string; state?: string; lat?: number; lng?: number };
  establishedYear?: number;
  affiliationNo?: string;
  classes?: string;
  admissionOpen?: boolean;
  isFeatured?: boolean;
  monthlyFee?: number;
  annualFee?: number;
  facilities?: unknown;
  categories?: string[];
  sections?: RawSection[];
  academics?: {
    classesFrom?: string;
    classesTo?: string;
    admissionOpen?: boolean;
  };
  fees?: {
    tuitionFeeMonthly?: number;
    tuitionFeeAnnual?: number;
    admissionFee?: number;
    transportFee?: number;
    hostelFee?: number;
    examFee?: number;
  };
  details?: {
    phone?: string;
    whatsapp?: string;
    establishedYear?: number;
    affiliationNo?: string;
  };
  citySlug?: string;
  lat?: number;
  lng?: number;
};

export function normalizeSchool(raw: unknown): NormalizedSchool {
  const school = raw as RawSchool;
  const city = school.city;
  const board = school.board;
  const academics = school.academics ?? {};
  const fees = school.fees ?? {};
  const details = school.details ?? {};
  const address = typeof school.address === "object" && school.address ? school.address : {};
  const sections = Array.isArray(school.sections) ? school.sections : [];

  const cityName = typeof city === "string" ? city : city?.name ?? address.city ?? "Unknown city";
  const stateName = typeof city === "object" ? city?.state?.name : school.state;
  const boardName = typeof board === "string" ? board : board?.name ?? "CBSE";
  const facilities = normalizeFacilities(school.facilities);

  return {
    id: String(school.id),
    name: String(school.name),
    slug: String(school.slug),
    city: cityName,
    citySlug: typeof city === "object" ? city?.slug ?? slugify(cityName) : school.citySlug ?? slugify(cityName),
    cityId:
      typeof city === "object" && city && "id" in city && city.id != null ? String(city.id) : undefined,
    state: stateName ?? address.state ?? "Uttar Pradesh",
    board: boardName,
    type: school.type ?? "Co-ed",
    format: school.format ?? (facilities.includes("Hostel") ? "Boarding" : "Day"),
    medium: school.medium ?? "English",
    description: school.description ?? "",
    logo: school.logo ?? "/school-logo.svg",
    image:
      school.image ??
      school.gallery?.[0]?.cloudinaryUrl ??
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    phone: details.phone ?? school.phone ?? "",
    whatsapp: details.whatsapp ?? school.whatsapp ?? "",
    address: address.addressLine ?? (typeof school.address === "string" ? school.address : cityName),
    establishedYear: details.establishedYear ?? school.establishedYear ?? 0,
    affiliationNo: details.affiliationNo ?? school.affiliationNo ?? "N/A",
    classes:
      school.classes ??
      (academics.classesFrom && academics.classesTo ? `${academics.classesFrom} - ${academics.classesTo}` : "N/A"),
    admissionOpen: academics.admissionOpen ?? school.admissionOpen ?? false,
    isFeatured: school.isFeatured ?? false,
    monthlyFee: fees.tuitionFeeMonthly ?? school.monthlyFee ?? 0,
    annualFee: fees.tuitionFeeAnnual ?? school.annualFee ?? 0,
    admissionFee: fees.admissionFee,
    transportFee: fees.transportFee ?? undefined,
    hostelFee: fees.hostelFee ?? undefined,
    examFee: fees.examFee,
    facilities,
    categories: school.categories ?? (sections.map((section) => section.sectionType).filter(Boolean) as string[]),
    lat: address.lat ?? school.lat ?? 0,
    lng: address.lng ?? school.lng ?? 0,
    gallery: school.gallery?.map((item) => item.cloudinaryUrl).filter(Boolean) as string[] | undefined,
  };
}

export type SchoolQueryParams = {
  q?: string;
  city?: string;
  board?: string;
  facility?: string;
  category?: string;
  featured?: boolean;
  admissionOpen?: boolean;
  sort?: "relevance" | "fee-asc" | "fee-desc" | "newest";
  page?: number;
  limit?: number;
};

const emptyPagination = (limit: number): ApiPagination => ({
  page: 1,
  limit,
  total: 0,
  totalPages: 0
});

export async function fetchSchoolsList(params: SchoolQueryParams): Promise<SchoolsListResponse> {
  const limit = params.limit ?? 12;

  try {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.city) search.set("city", params.city);
    if (params.board) search.set("board", params.board);
    if (params.facility) search.set("facility", params.facility);
    if (params.category) search.set("category", params.category);
    if (params.featured) search.set("featured", "true");
    if (params.admissionOpen) search.set("admissionOpen", "true");
    if (params.sort) search.set("sort", params.sort);
    search.set("page", String(params.page ?? 1));
    search.set("limit", String(limit));

    const response = await fetch(`${API_URL}/api/schools?${search.toString()}`, {
      next: { revalidate: 3600 }
    });
    if (!response.ok) {
      throw new Error(`Schools API returned ${response.status}`);
    }

    const payload = (await response.json()) as { data?: unknown[]; pagination?: Partial<ApiPagination> };
    const total = payload.pagination?.total ?? payload.data?.length ?? 0;

    return {
      data: (payload.data ?? []).map(normalizeSchool),
      pagination: {
        page: payload.pagination?.page ?? params.page ?? 1,
        limit: payload.pagination?.limit ?? limit,
        total,
        totalPages: payload.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit))
      }
    };
  } catch {
    return { data: [], pagination: emptyPagination(limit) };
  }
}

export async function fetchSchoolDetailBySlug(slug: string): Promise<unknown | null> {
  try {
    const response = await fetch(`${API_URL}/api/schools/${slug}`, { next: { revalidate: 3600 } });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`School API returned ${response.status}`);
    }
    const payload = (await response.json()) as { data?: unknown };
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchSchoolBySlug(slug: string): Promise<NormalizedSchool | null> {
  try {
    const response = await fetch(`${API_URL}/api/schools/${slug}`, { next: { revalidate: 3600 } });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`School API returned ${response.status}`);
    }
    const payload = (await response.json()) as { data?: unknown };
    return payload.data ? normalizeSchool(payload.data) : null;
  } catch {
    return null;
  }
}

export type CityRecord = {
  id: string;
  name: string;
  slug: string;
  _count?: { schools: number };
};

export async function fetchCities(): Promise<CityRecord[]> {
  try {
    const response = await fetch(`${API_URL}/api/cities`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: CityRecord[] };
    return payload.data ?? [];
  } catch {
    return [];
  }
}

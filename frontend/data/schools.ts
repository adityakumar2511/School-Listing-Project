// ─── Types ───────────────────────────────────────────────────────────────────

export type Board = "CBSE" | "ICSE" | "UP Board" | "IB" | "IGCSE"

export type SchoolType =
  | "Private"
  | "Government"
  | "Government Aided"
  | "Semi-Residential"

export type Gender = "Co-Educational" | "Boys" | "Girls"

export type Medium = "English" | "Hindi" | "Urdu" | "English+Hindi"

export type EducationLevel =
  | "Preschool"
  | "Primary"
  | "Middle"
  | "Secondary"
  | "Senior Secondary"

export type FeeRange = "budget" | "mid-range" | "premium" | "luxury"

export type SpecialFocus =
  | "IIT/NEET"
  | "Sports"
  | "Scholarship"
  | "Minority"
  | "Robotics"
  | "Arts"

export interface SchoolFacilities {
  hostel: boolean
  transport: boolean
  library: boolean
  labs: boolean
  smartClassroom: boolean
  wifi: boolean
  cctv: boolean
  sportsGround: boolean
  swimmingPool: boolean
  auditorium: boolean
  cafeteria: boolean
  medicalRoom: boolean
}

export interface School {
  id: string
  name: string
  slug: string
  tagline?: string
  description: string

  city: string
  citySlug: string
  area: string
  address: string
  pincode: string
  googleMapsUrl?: string

  board: Board
  schoolType: SchoolType
  gender: Gender
  medium: Medium[]
  educationLevels: EducationLevel[]
  classesFrom: string
  classesTo: string

  admissionOpen: boolean
  admissionSession: string
  admissionClasses: string[]

  feeRange: FeeRange
  admissionFee?: number
  monthlyFee?: number
  annualFee?: number
  transportFee?: number
  hostelFee?: number

  phone: string
  whatsapp: string
  email?: string
  website?: string

  principalName?: string
  establishedYear?: number
  affiliationNo?: string

  facilities: SchoolFacilities
  specialFocus: SpecialFocus[]

  logo?: string
  coverImage?: string
  gallery?: string[]

  isFeatured: boolean
  isVerified: boolean
  status: "approved" | "pending"
  createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const BOARDS: Board[] = ["CBSE", "ICSE", "UP Board", "IB", "IGCSE"]

export const SCHOOL_TYPES: SchoolType[] = [
  "Private",
  "Government",
  "Government Aided",
  "Semi-Residential",
]

export const GENDERS: Gender[] = ["Co-Educational", "Boys", "Girls"]

export const MEDIUMS: Medium[] = ["English", "Hindi", "Urdu", "English+Hindi"]

export const EDUCATION_LEVELS: EducationLevel[] = [
  "Preschool",
  "Primary",
  "Middle",
  "Secondary",
  "Senior Secondary",
]

export const SPECIAL_FOCUS_OPTIONS: SpecialFocus[] = [
  "IIT/NEET",
  "Sports",
  "Scholarship",
  "Minority",
  "Robotics",
  "Arts",
]

export const FEE_RANGES = {
  budget: { label: "Budget", description: "Under ₹2,000/month" },
  "mid-range": { label: "Mid-Range", description: "₹2,000 - ₹5,000/month" },
  premium: { label: "Premium", description: "₹5,000 - ₹15,000/month" },
  luxury: { label: "Luxury", description: "Above ₹15,000/month" },
} as const

export const TARGET_CITIES = [
  { name: "Prayagraj", slug: "prayagraj", state: "Uttar Pradesh" },
  { name: "Lucknow", slug: "lucknow", state: "Uttar Pradesh" },
  { name: "Kanpur", slug: "kanpur", state: "Uttar Pradesh" },
  { name: "Jhansi", slug: "jhansi", state: "Uttar Pradesh" },
  { name: "Banda", slug: "banda", state: "Uttar Pradesh" },
]

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const mockSchools: School[] = [
  {
    id: "1",
    name: "Sangam Valley International School",
    slug: "sangam-valley-international-school",
    tagline: "Excellence in Education since 1998",
    description:
      "Prayagraj ke Civil Lines area mein located, Sangam Valley CBSE affiliated school hai jo Class Nursery se 12 tak quality education provide karta hai. IIT/NEET coaching integrated curriculum ke saath.",
    city: "Prayagraj",
    citySlug: "prayagraj",
    area: "Civil Lines",
    address: "14, Thornhill Road, Civil Lines, Prayagraj",
    pincode: "211001",
    board: "CBSE",
    schoolType: "Private",
    gender: "Co-Educational",
    medium: ["English"],
    educationLevels: [
      "Preschool",
      "Primary",
      "Middle",
      "Secondary",
      "Senior Secondary",
    ],
    classesFrom: "Nursery",
    classesTo: "Class 12",
    admissionOpen: true,
    admissionSession: "2025-26",
    admissionClasses: ["Nursery", "Class 1", "Class 6", "Class 11"],
    feeRange: "mid-range",
    admissionFee: 25000,
    monthlyFee: 4200,
    annualFee: 50400,
    transportFee: 1200,
    phone: "0532-2240100",
    whatsapp: "919532240100",
    email: "info@sangamvalley.edu.in",
    principalName: "Dr. Meera Srivastava",
    establishedYear: 1998,
    affiliationNo: "2130045",
    facilities: {
      hostel: false,
      transport: true,
      library: true,
      labs: true,
      smartClassroom: true,
      wifi: true,
      cctv: true,
      sportsGround: true,
      swimmingPool: false,
      auditorium: true,
      cafeteria: false,
      medicalRoom: true,
    },
    specialFocus: ["IIT/NEET"],
    isFeatured: true,
    isVerified: true,
    status: "approved",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Allahabad Public School",
    slug: "allahabad-public-school",
    tagline: "Building Leaders of Tomorrow",
    description:
      "ICSE board affiliated school in Lukerganj with state-of-the-art facilities. Known for academic excellence and extracurricular activities.",
    city: "Prayagraj",
    citySlug: "prayagraj",
    area: "Lukerganj",
    address: "Civil Station, Lukerganj, Prayagraj",
    pincode: "211001",
    board: "ICSE",
    schoolType: "Private",
    gender: "Co-Educational",
    medium: ["English"],
    educationLevels: ["Primary", "Middle", "Secondary", "Senior Secondary"],
    classesFrom: "Class 1",
    classesTo: "Class 12",
    admissionOpen: true,
    admissionSession: "2025-26",
    admissionClasses: ["Class 1", "Class 6", "Class 11"],
    feeRange: "premium",
    admissionFee: 30000,
    monthlyFee: 5800,
    annualFee: 69600,
    transportFee: 1500,
    phone: "0532-2400200",
    whatsapp: "919532400200",
    email: "admissions@aps.edu.in",
    principalName: "Mr. Rajesh Kumar Pandey",
    establishedYear: 1985,
    affiliationNo: "ICS-UP-045",
    facilities: {
      hostel: false,
      transport: true,
      library: true,
      labs: true,
      smartClassroom: true,
      wifi: true,
      cctv: true,
      sportsGround: true,
      swimmingPool: false,
      auditorium: true,
      cafeteria: true,
      medicalRoom: true,
    },
    specialFocus: ["IIT/NEET", "Arts"],
    isFeatured: true,
    isVerified: true,
    status: "approved",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Naini Residential Academy",
    slug: "naini-residential-academy",
    tagline: "Where Discipline Meets Excellence",
    description:
      "Boys residential school in Naini with full hostel facility. Specializes in sports and IIT/NEET preparation for Class 6-12 students.",
    city: "Prayagraj",
    citySlug: "prayagraj",
    area: "Naini",
    address: "Industrial Area, Naini, Prayagraj",
    pincode: "211008",
    board: "CBSE",
    schoolType: "Semi-Residential",
    gender: "Boys",
    medium: ["English", "Hindi"],
    educationLevels: ["Middle", "Secondary", "Senior Secondary"],
    classesFrom: "Class 6",
    classesTo: "Class 12",
    admissionOpen: true,
    admissionSession: "2025-26",
    admissionClasses: ["Class 6", "Class 9", "Class 11"],
    feeRange: "mid-range",
    admissionFee: 15000,
    monthlyFee: 3600,
    annualFee: 43200,
    hostelFee: 8000,
    transportFee: 0,
    phone: "0532-2780300",
    whatsapp: "919532780300",
    principalName: "Col. (Retd.) Arun Singh",
    establishedYear: 2005,
    affiliationNo: "2130089",
    facilities: {
      hostel: true,
      transport: false,
      library: true,
      labs: true,
      smartClassroom: false,
      wifi: false,
      cctv: true,
      sportsGround: true,
      swimmingPool: false,
      auditorium: false,
      cafeteria: true,
      medicalRoom: true,
    },
    specialFocus: ["Sports", "IIT/NEET"],
    isFeatured: false,
    isVerified: true,
    status: "approved",
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Govt. Jubilee Inter College",
    slug: "govt-jubilee-inter-college",
    tagline: "Government School, Quality Education",
    description:
      "UP Board affiliated government school providing affordable quality education. Scholarship programs available for meritorious students.",
    city: "Prayagraj",
    citySlug: "prayagraj",
    area: "Allahabad City",
    address: "Jubilee Road, Allahabad City, Prayagraj",
    pincode: "211002",
    board: "UP Board",
    schoolType: "Government",
    gender: "Co-Educational",
    medium: ["Hindi"],
    educationLevels: ["Middle", "Secondary", "Senior Secondary"],
    classesFrom: "Class 6",
    classesTo: "Class 12",
    admissionOpen: true,
    admissionSession: "2025-26",
    admissionClasses: ["Class 6", "Class 9", "Class 11"],
    feeRange: "budget",
    admissionFee: 500,
    monthlyFee: 200,
    phone: "0532-2500400",
    whatsapp: "919532500400",
    principalName: "Shri Ramesh Chandra Verma",
    establishedYear: 1920,
    facilities: {
      hostel: false,
      transport: false,
      library: true,
      labs: false,
      smartClassroom: false,
      wifi: false,
      cctv: false,
      sportsGround: true,
      swimmingPool: false,
      auditorium: false,
      cafeteria: false,
      medicalRoom: false,
    },
    specialFocus: ["Scholarship"],
    isFeatured: false,
    isVerified: true,
    status: "approved",
    createdAt: "2024-02-10",
  },
  {
    id: "5",
    name: "St. Joseph's Convent School",
    slug: "st-josephs-convent-school",
    tagline: "Nurturing Young Minds with Values",
    description:
      "Premier girls school in Cantonment area. ICSE affiliated with focus on holistic development through academics and performing arts.",
    city: "Prayagraj",
    citySlug: "prayagraj",
    area: "Cantonment",
    address: "MG Marg, Cantonment, Prayagraj",
    pincode: "211001",
    board: "ICSE",
    schoolType: "Private",
    gender: "Girls",
    medium: ["English"],
    educationLevels: ["Preschool", "Primary", "Middle", "Secondary"],
    classesFrom: "Nursery",
    classesTo: "Class 10",
    admissionOpen: false,
    admissionSession: "2025-26",
    admissionClasses: [],
    feeRange: "mid-range",
    admissionFee: 20000,
    monthlyFee: 3800,
    annualFee: 45600,
    transportFee: 1000,
    phone: "0532-2620500",
    whatsapp: "919532620500",
    email: "info@stjosephsprayagraj.edu.in",
    principalName: "Sr. Maria Fernandes",
    establishedYear: 1952,
    affiliationNo: "ICS-UP-012",
    facilities: {
      hostel: false,
      transport: true,
      library: true,
      labs: true,
      smartClassroom: true,
      wifi: false,
      cctv: true,
      sportsGround: false,
      swimmingPool: false,
      auditorium: true,
      cafeteria: false,
      medicalRoom: false,
    },
    specialFocus: ["Arts"],
    isFeatured: false,
    isVerified: true,
    status: "approved",
    createdAt: "2024-02-15",
  },
]

// ─── Backward-Compatible Aliases ─────────────────────────────────────────────
// Keep old import names working across the codebase.

export const schools = mockSchools
export const targetCities = TARGET_CITIES
export const boards = BOARDS
export const facilities: string[] = [
  "Library",
  "Labs",
  "Hostel",
  "Transport",
  "Smart Classroom",
  "WiFi",
  "CCTV",
  "Sports Ground",
  "Swimming Pool",
  "Auditorium",
  "Cafeteria",
  "Medical Room",
]

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getSchoolsByCity(citySlug: string): School[] {
  return mockSchools.filter(
    (s) => s.citySlug === citySlug && s.status === "approved"
  )
}

export function getSchoolBySlug(slug: string): School | undefined {
  return mockSchools.find((s) => s.slug === slug)
}

export function getFeaturedSchools(): School[] {
  return mockSchools.filter((s) => s.isFeatured && s.status === "approved")
}

export function getAdmissionOpenSchools(): School[] {
  return mockSchools.filter((s) => s.admissionOpen && s.status === "approved")
}

export function filterSchools(filters: {
  citySlug?: string
  board?: Board
  gender?: Gender
  feeRange?: FeeRange
  facilities?: (keyof SchoolFacilities)[]
  specialFocus?: SpecialFocus
  q?: string
}): School[] {
  return mockSchools.filter((school) => {
    if (school.status !== "approved") return false
    if (filters.citySlug && school.citySlug !== filters.citySlug) return false
    if (filters.board && school.board !== filters.board) return false
    if (filters.gender && school.gender !== filters.gender) return false
    if (filters.feeRange && school.feeRange !== filters.feeRange) return false
    if (
      filters.specialFocus &&
      !school.specialFocus.includes(filters.specialFocus)
    )
      return false
    if (filters.facilities?.length) {
      const hasAll = filters.facilities.every((f) => school.facilities[f])
      if (!hasAll) return false
    }
    if (filters.q) {
      const q = filters.q.toLowerCase()
      const searchable =
        `${school.name} ${school.area} ${school.board} ${school.description}`.toLowerCase()
      if (!searchable.includes(q)) return false
    }
    return true
  })
}

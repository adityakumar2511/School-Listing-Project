export type School = {
  id: string;
  name: string;
  slug: string;
  city: string;
  citySlug: string;
  state: string;
  board: string;
  type: string;
  format: string;
  medium: string;
  description: string;
  logo: string;
  image: string;
  phone: string;
  whatsapp: string;
  address: string;
  establishedYear: number;
  affiliationNo: string;
  classes: string;
  admissionOpen: boolean;
  isFeatured: boolean;
  monthlyFee: number;
  annualFee: number;
  facilities: string[];
  categories: string[];
  lat: number;
  lng: number;
  admissionFee?: number;
  transportFee?: number | null;
  hostelFee?: number | null;
  examFee?: number;
  gallery?: string[];
  raw?: unknown;
};

export const targetCities = [
  { name: "Prayagraj", slug: "prayagraj" },
  { name: "Lucknow", slug: "lucknow" },
  { name: "Kanpur", slug: "kanpur" },
  { name: "Jhansi", slug: "jhansi" },
  { name: "Banda", slug: "banda" }
];

export const schools: School[] = [
  {
    id: "sch_001",
    name: "Sangam Valley International School",
    slug: "sangam-valley-international-school",
    city: "Prayagraj",
    citySlug: "prayagraj",
    state: "Uttar Pradesh",
    board: "CBSE",
    type: "Co-ed",
    format: "Day-Boarding",
    medium: "English",
    description:
      "A CBSE school with strong science labs, Olympiad support, and structured admission counseling for middle-income families.",
    logo: "/school-logo.svg",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    phone: "+91 98765 43210",
    whatsapp: "919876543210",
    address: "Civil Lines, Prayagraj, Uttar Pradesh",
    establishedYear: 2008,
    affiliationNo: "2130XXX",
    classes: "Nursery - XII",
    admissionOpen: true,
    isFeatured: true,
    monthlyFee: 4200,
    annualFee: 50400,
    facilities: ["Library", "Labs", "Transport", "Smart Classroom", "CCTV", "Playground"],
    categories: ["iit-neet", "sports"],
    lat: 25.4358,
    lng: 81.8463
  },
  {
    id: "sch_002",
    name: "Avadh Scholars Academy",
    slug: "avadh-scholars-academy",
    city: "Lucknow",
    citySlug: "lucknow",
    state: "Uttar Pradesh",
    board: "ICSE",
    type: "Co-ed",
    format: "Day",
    medium: "English",
    description:
      "An ICSE campus focused on communication, project-based learning, sports participation, and parent-friendly reporting.",
    logo: "/school-logo.svg",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    phone: "+91 99887 77665",
    whatsapp: "919988777665",
    address: "Gomti Nagar, Lucknow, Uttar Pradesh",
    establishedYear: 1999,
    affiliationNo: "UPICSE-112",
    classes: "LKG - XII",
    admissionOpen: true,
    isFeatured: true,
    monthlyFee: 5800,
    annualFee: 69600,
    facilities: ["Library", "Labs", "Transport", "Auditorium", "Cafeteria", "Playground"],
    categories: ["sports"],
    lat: 26.8467,
    lng: 80.9462
  },
  {
    id: "sch_003",
    name: "Bundelkhand Public School",
    slug: "bundelkhand-public-school",
    city: "Jhansi",
    citySlug: "jhansi",
    state: "Uttar Pradesh",
    board: "CBSE",
    type: "Co-ed",
    format: "Boarding",
    medium: "English/Hindi",
    description:
      "Residential and day-boarding school with hostel, disciplined routines, competitive exam foundation, and sports coaching.",
    logo: "/school-logo.svg",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    phone: "+91 91234 56780",
    whatsapp: "919123456780",
    address: "Sipri Road, Jhansi, Uttar Pradesh",
    establishedYear: 2012,
    affiliationNo: "2131XXX",
    classes: "I - XII",
    admissionOpen: false,
    isFeatured: false,
    monthlyFee: 3600,
    annualFee: 43200,
    facilities: ["Hostel", "Transport", "Labs", "CCTV", "Playground", "Gym"],
    categories: ["hostel", "iit-neet"],
    lat: 25.4484,
    lng: 78.5685
  },
  {
    id: "sch_004",
    name: "Kanpur Girls Senior Secondary School",
    slug: "kanpur-girls-senior-secondary-school",
    city: "Kanpur",
    citySlug: "kanpur",
    state: "Uttar Pradesh",
    board: "UP Board",
    type: "Girls",
    format: "Day",
    medium: "Hindi",
    description:
      "Affordable girls school with a strong arts and commerce pathway, scholarship support, and safe transport options.",
    logo: "/school-logo.svg",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80",
    phone: "+91 93456 78901",
    whatsapp: "919345678901",
    address: "Swaroop Nagar, Kanpur, Uttar Pradesh",
    establishedYear: 1988,
    affiliationNo: "UPB-7791",
    classes: "VI - XII",
    admissionOpen: true,
    isFeatured: false,
    monthlyFee: 1800,
    annualFee: 21600,
    facilities: ["Library", "Transport", "CCTV", "Smart Classroom"],
    categories: ["girls"],
    lat: 26.4499,
    lng: 80.3319
  },
  {
    id: "sch_005",
    name: "Banda Central Academy",
    slug: "banda-central-academy",
    city: "Banda",
    citySlug: "banda",
    state: "Uttar Pradesh",
    board: "CBSE",
    type: "Co-ed",
    format: "Day",
    medium: "English/Hindi",
    description:
      "Value-focused CBSE school for Banda families with transport, digital classrooms, and close academic mentoring.",
    logo: "/school-logo.svg",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    phone: "+91 95678 12340",
    whatsapp: "919567812340",
    address: "Station Road, Banda, Uttar Pradesh",
    establishedYear: 2015,
    affiliationNo: "2132XXX",
    classes: "Nursery - X",
    admissionOpen: true,
    isFeatured: false,
    monthlyFee: 2400,
    annualFee: 28800,
    facilities: ["Library", "Transport", "Smart Classroom", "Playground"],
    categories: ["sports"],
    lat: 25.4763,
    lng: 80.3398
  }
];

export const boards = ["CBSE", "ICSE", "UP Board", "IB", "IGCSE"];
export const facilities = ["Library", "Labs", "Hostel", "Transport", "Smart Classroom", "CCTV", "Playground", "Auditorium"];

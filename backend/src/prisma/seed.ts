import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── ADMIN CREDENTIALS ─────────────────────────────────────────────────────────
// Replace with your real phone number BEFORE running `npm run seed`.
// This is the phone used to log in via OTP at /auth/parent/login.
// Must include country code, e.g. "+919876543210".
const ADMIN_PHONE = "+91XXXXXXXXXX";
const ADMIN_NAME = "SchoolSetu Admin";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"
];

const stateSeed = { name: "Uttar Pradesh", slug: "uttar-pradesh" };

const citySeeds = [
  { name: "Prayagraj", slug: "prayagraj", hasSchools: true },
  { name: "Banda", slug: "banda", hasSchools: false },
  { name: "Kanpur", slug: "kanpur", hasSchools: false },
  { name: "Jhansi", slug: "jhansi", hasSchools: false },
  { name: "Lucknow", slug: "lucknow", hasSchools: true }
];

const boardSeeds = [
  { name: "CBSE", slug: "cbse" },
  { name: "ICSE", slug: "icse" },
  { name: "UP Board", slug: "up_board" },
  { name: "IB", slug: "ib" },
  { name: "IGCSE", slug: "igcse" }
];

const facilitySeeds = [
  { name: "Transport", slug: "transport", icon: "bus" },
  { name: "Hostel", slug: "hostel", icon: "bed" },
  { name: "Sports", slug: "sports", icon: "trophy" },
  { name: "Library", slug: "library", icon: "book-open" },
  { name: "Labs", slug: "labs", icon: "flask-conical" },
  { name: "Canteen", slug: "canteen", icon: "utensils" },
  { name: "Smart Classroom", slug: "smart-classroom", icon: "monitor" },
  { name: "WiFi", slug: "wifi", icon: "wifi" },
  { name: "CCTV", slug: "cctv", icon: "camera" },
  { name: "Gym", slug: "gym", icon: "dumbbell" },
  { name: "Swimming Pool", slug: "swimming-pool", icon: "waves" },
  { name: "Playground", slug: "playground", icon: "trees" },
  { name: "Auditorium", slug: "auditorium", icon: "mic" }
];

type SchoolSeed = {
  name: string;
  slug: string;
  citySlug: string;
  boardSlug: string;
  type: string;
  medium: string;
  description: string;
  isFeatured?: boolean;
  details: {
    principalName: string;
    establishedYear: number;
    affiliationNo: string;
    website?: string;
    email: string;
    phone: string;
    whatsapp: string;
  };
  address: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
    googleMapsUrl: string;
  };
  fees: {
    admissionFee: number;
    tuitionFeeMonthly: number;
    tuitionFeeAnnual: number;
    transportFee: number | null;
    hostelFee: number | null;
    examFee: number;
  };
  facilities: Record<string, boolean>;
  academics: {
    streams: string[];
    classesFrom: string;
    classesTo: string;
    admissionOpen: boolean;
    documentsRequired: string[];
    ageCriteria: string;
  };
  sections?: Array<{ title: string; content: string; sectionType: string; order: number }>;
  achievements?: Array<{ title: string; year: number; description: string }>;
};

const schoolSeeds: SchoolSeed[] = [
  {
    name: "Sangam Valley International School",
    slug: "sangam-valley-international-school",
    citySlug: "prayagraj",
    boardSlug: "cbse",
    type: "Co-ed",
    medium: "English",
    isFeatured: true,
    description:
      "A CBSE school in Prayagraj focused on academic excellence, science learning, transport convenience, and admission guidance for growing families.",
    details: {
      principalName: "Dr. Meera Sinha",
      establishedYear: 2008,
      affiliationNo: "2130456",
      website: "https://sangamvalley.example",
      email: "admissions@sangamvalley.example",
      phone: "+919876543210",
      whatsapp: "+919876543210"
    },
    address: {
      addressLine: "Civil Lines, Near High Court Road",
      city: "Prayagraj",
      state: "Uttar Pradesh",
      pincode: "211001",
      lat: 25.4484,
      lng: 81.8333,
      googleMapsUrl: "https://maps.google.com/?q=Prayagraj"
    },
    fees: { admissionFee: 18000, tuitionFeeMonthly: 4200, tuitionFeeAnnual: 50400, transportFee: 1600, hostelFee: null, examFee: 3500 },
    facilities: { library: true, labs: true, transport: true, smartClassroom: true, playground: true, cafeteria: true, cctv: true, wifi: true },
    academics: {
      streams: ["Science", "Commerce"],
      classesFrom: "Nursery",
      classesTo: "XII",
      admissionOpen: true,
      documentsRequired: ["Birth certificate", "Transfer certificate", "Aadhaar card", "Previous report card"],
      ageCriteria: "As per CBSE admission norms"
    },
    sections: [{ title: "IIT/NEET Foundation", content: "Integrated foundation program from Class 9.", sectionType: "iit-neet", order: 1 }],
    achievements: [{ title: "District Science Fair Winner", year: 2024, description: "Senior team gold medal" }]
  },
  {
    name: "Prayagraj Public Academy",
    slug: "prayagraj-public-academy",
    citySlug: "prayagraj",
    boardSlug: "icse",
    type: "Co-ed",
    medium: "English",
    description:
      "An ICSE school offering strong English communication, project-based learning, library access, sports activities, and parent-friendly progress reporting.",
    details: {
      principalName: "Mrs. Anjali Verma",
      establishedYear: 1998,
      affiliationNo: "UP/ICSE/1123",
      email: "info@prayagrajpublic.example",
      phone: "+919812345670",
      whatsapp: "+919812345670"
    },
    address: {
      addressLine: "Tagore Town, Prayagraj",
      city: "Prayagraj",
      state: "Uttar Pradesh",
      pincode: "211002",
      lat: 25.4541,
      lng: 81.8602,
      googleMapsUrl: "https://maps.google.com/?q=Tagore+Town+Prayagraj"
    },
    fees: { admissionFee: 22000, tuitionFeeMonthly: 5200, tuitionFeeAnnual: 62400, transportFee: 1800, hostelFee: null, examFee: 4200 },
    facilities: { library: true, labs: true, transport: true, playground: true, cafeteria: true, auditorium: true, cctv: true },
    academics: {
      streams: ["Science", "Commerce", "Humanities"],
      classesFrom: "LKG",
      classesTo: "XII",
      admissionOpen: true,
      documentsRequired: ["Birth certificate", "Transfer certificate", "Photographs", "Previous report card"],
      ageCriteria: "Age eligibility depends on class applied for"
    },
    sections: [{ title: "Sports Academy", content: "Cricket, basketball, and athletics coaching.", sectionType: "sports", order: 1 }]
  },
  {
    name: "Triveni Senior Secondary School",
    slug: "triveni-senior-secondary-school",
    citySlug: "prayagraj",
    boardSlug: "up_board",
    type: "Co-ed",
    medium: "Hindi/English",
    description:
      "An affordable senior secondary school in Prayagraj with transport, library, labs, canteen, and practical learning support for local families.",
    details: {
      principalName: "Mr. Rakesh Tiwari",
      establishedYear: 1985,
      affiliationNo: "UPB/PRY/7781",
      email: "office@trivenischool.example",
      phone: "+919900112233",
      whatsapp: "+919900112233"
    },
    address: {
      addressLine: "Naini, Prayagraj",
      city: "Prayagraj",
      state: "Uttar Pradesh",
      pincode: "211008",
      lat: 25.3919,
      lng: 81.8629,
      googleMapsUrl: "https://maps.google.com/?q=Naini+Prayagraj"
    },
    fees: { admissionFee: 9000, tuitionFeeMonthly: 2400, tuitionFeeAnnual: 28800, transportFee: 1200, hostelFee: 4500, examFee: 1800 },
    facilities: { library: true, labs: true, transport: true, hostel: true, playground: true, cafeteria: true, cctv: true },
    academics: {
      streams: ["Science", "Commerce", "Arts"],
      classesFrom: "VI",
      classesTo: "XII",
      admissionOpen: true,
      documentsRequired: ["Transfer certificate", "Aadhaar card", "Previous report card"],
      ageCriteria: "As per UP Board admission norms"
    },
    sections: [{ title: "Hostel Life", content: "Separate wings for boys and girls with warden supervision.", sectionType: "hostel", order: 1 }]
  },
  {
    name: "Ganges Global School",
    slug: "ganges-global-school",
    citySlug: "prayagraj",
    boardSlug: "cbse",
    type: "Co-ed",
    medium: "English",
    description: "Modern CBSE campus with smart classrooms, swimming pool, and strong STEM labs near the Ganges belt.",
    details: {
      principalName: "Dr. Sanjay Patel",
      establishedYear: 2012,
      affiliationNo: "2130991",
      email: "hello@gangesglobal.example",
      phone: "+919711223344",
      whatsapp: "+919711223344"
    },
    address: {
      addressLine: "Jhunsi Road, Prayagraj",
      city: "Prayagraj",
      state: "Uttar Pradesh",
      pincode: "211019",
      lat: 25.42,
      lng: 81.88,
      googleMapsUrl: "https://maps.google.com/?q=Jhunsi+Prayagraj"
    },
    fees: { admissionFee: 25000, tuitionFeeMonthly: 6100, tuitionFeeAnnual: 73200, transportFee: 2000, hostelFee: null, examFee: 5000 },
    facilities: { library: true, labs: true, transport: true, smartClassroom: true, swimmingPool: true, gym: true, playground: true, wifi: true, cctv: true },
    academics: {
      streams: ["Science", "Commerce"],
      classesFrom: "Nursery",
      classesTo: "XII",
      admissionOpen: true,
      documentsRequired: ["Birth certificate", "Aadhaar card", "Previous report card"],
      ageCriteria: "CBSE age criteria"
    },
    sections: [{ title: "NEET Prep Track", content: "Weekly NEET mock tests and doubt clinics.", sectionType: "iit-neet", order: 1 }]
  },
  {
    name: "Allahabad Heritage Academy",
    slug: "allahabad-heritage-academy",
    citySlug: "prayagraj",
    boardSlug: "icse",
    type: "Girls",
    medium: "English",
    description: "Girls-only ICSE school emphasizing leadership, arts, and safe campus environment in central Prayagraj.",
    details: {
      principalName: "Sister Maria Joseph",
      establishedYear: 1975,
      affiliationNo: "ICSE/PRY/441",
      email: "admissions@heritageacademy.example",
      phone: "+919455667788",
      whatsapp: "+919455667788"
    },
    address: {
      addressLine: "George Town, Prayagraj",
      city: "Prayagraj",
      state: "Uttar Pradesh",
      pincode: "211002",
      lat: 25.44,
      lng: 81.85,
      googleMapsUrl: "https://maps.google.com/?q=George+Town+Prayagraj"
    },
    fees: { admissionFee: 15000, tuitionFeeMonthly: 4800, tuitionFeeAnnual: 57600, transportFee: 1400, hostelFee: null, examFee: 3200 },
    facilities: { library: true, labs: true, transport: true, auditorium: true, playground: true, cctv: true },
    academics: {
      streams: ["Science", "Commerce", "Humanities"],
      classesFrom: "I",
      classesTo: "XII",
      admissionOpen: false,
      documentsRequired: ["Birth certificate", "Transfer certificate"],
      ageCriteria: "ICSE norms"
    }
  },
  {
    name: "Lucknow International Academy",
    slug: "lucknow-international-academy",
    citySlug: "lucknow",
    boardSlug: "ib",
    type: "Co-ed",
    medium: "English",
    isFeatured: true,
    description: "IB continuum school in Gomti Nagar with global pedagogy, hostel, and premium sports infrastructure.",
    details: {
      principalName: "Dr. Elena D'Souza",
      establishedYear: 2010,
      affiliationNo: "IB/IN/0098",
      email: "admissions@lia.example",
      phone: "+919512345678",
      whatsapp: "+919512345678"
    },
    address: {
      addressLine: "Gomti Nagar, Lucknow",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226010",
      lat: 26.85,
      lng: 81.0,
      googleMapsUrl: "https://maps.google.com/?q=Gomti+Nagar+Lucknow"
    },
    fees: { admissionFee: 50000, tuitionFeeMonthly: 12000, tuitionFeeAnnual: 144000, transportFee: 2500, hostelFee: 8000, examFee: 8000 },
    facilities: { library: true, labs: true, transport: true, hostel: true, smartClassroom: true, swimmingPool: true, gym: true, auditorium: true, wifi: true, cctv: true },
    academics: {
      streams: ["IB PYP", "IB MYP", "IB DP"],
      classesFrom: "Nursery",
      classesTo: "XII",
      admissionOpen: true,
      documentsRequired: ["Passport photos", "Previous school records", "Medical form"],
      ageCriteria: "IB placement assessment"
    },
    sections: [{ title: "Boarding", content: "Premium hostel with study halls and weekend activities.", sectionType: "hostel", order: 1 }]
  },
  {
    name: "Avadh Scholars School",
    slug: "avadh-scholars-school",
    citySlug: "lucknow",
    boardSlug: "cbse",
    type: "Co-ed",
    medium: "English",
    description: "Affordable CBSE school in Aliganj with IIT foundation, transport fleet, and parent WhatsApp updates.",
    details: {
      principalName: "Mr. Imran Khan",
      establishedYear: 2005,
      affiliationNo: "2131200",
      email: "contact@avadhscholars.example",
      phone: "+919800112233",
      whatsapp: "+919800112233"
    },
    address: {
      addressLine: "Aliganj, Lucknow",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226024",
      lat: 26.89,
      lng: 80.95,
      googleMapsUrl: "https://maps.google.com/?q=Aliganj+Lucknow"
    },
    fees: { admissionFee: 12000, tuitionFeeMonthly: 3800, tuitionFeeAnnual: 45600, transportFee: 1500, hostelFee: null, examFee: 2800 },
    facilities: { library: true, labs: true, transport: true, smartClassroom: true, playground: true, cafeteria: true, cctv: true },
    academics: {
      streams: ["Science", "Commerce"],
      classesFrom: "Nursery",
      classesTo: "XII",
      admissionOpen: true,
      documentsRequired: ["Birth certificate", "Aadhaar card", "Report card"],
      ageCriteria: "CBSE norms"
    },
    sections: [{ title: "IIT Foundation", content: "Olympiad and JEE foundation from Class 6.", sectionType: "iit-neet", order: 1 }]
  }
];

async function upsertSchool(seed: SchoolSeed, stateId: string) {
  const city = await prisma.city.findUniqueOrThrow({ where: { slug: seed.citySlug } });
  const board = await prisma.board.findUniqueOrThrow({ where: { slug: seed.boardSlug } });

  const school = await prisma.school.upsert({
    where: { slug: seed.slug },
    update: {
      name: seed.name,
      cityId: city.id,
      stateId: stateId,
      boardId: board.id,
      type: seed.type,
      medium: seed.medium,
      description: seed.description,
      status: "approved",
      isFeatured: seed.isFeatured ?? false
    },
    create: {
      name: seed.name,
      slug: seed.slug,
      cityId: city.id,
      stateId: stateId,
      boardId: board.id,
      type: seed.type,
      medium: seed.medium,
      description: seed.description,
      status: "approved",
      isFeatured: seed.isFeatured ?? false
    }
  });

  await prisma.schoolDetails.upsert({
    where: { schoolId: school.id },
    update: seed.details,
    create: { schoolId: school.id, ...seed.details }
  });

  await prisma.schoolAddress.upsert({
    where: { schoolId: school.id },
    update: seed.address,
    create: { schoolId: school.id, ...seed.address }
  });

  await prisma.schoolFees.upsert({
    where: { schoolId: school.id },
    update: seed.fees,
    create: { schoolId: school.id, ...seed.fees }
  });

  await prisma.schoolFacilities.upsert({
    where: { schoolId: school.id },
    update: seed.facilities,
    create: { schoolId: school.id, ...seed.facilities }
  });

  await prisma.schoolAcademics.upsert({
    where: { schoolId: school.id },
    update: seed.academics,
    create: { schoolId: school.id, ...seed.academics }
  });

  await prisma.schoolGallery.deleteMany({ where: { schoolId: school.id } });
  await prisma.schoolGallery.createMany({
    data: GALLERY_IMAGES.map((url, index) => ({
      schoolId: school.id,
      type: "photo" as const,
      cloudinaryUrl: url,
      caption: `${seed.name} campus ${index + 1}`,
      order: index
    }))
  });

  await prisma.schoolSection.deleteMany({ where: { schoolId: school.id } });
  if (seed.sections?.length) {
    await prisma.schoolSection.createMany({
      data: seed.sections.map((section) => ({ schoolId: school.id, ...section }))
    });
  }

  await prisma.schoolAchievement.deleteMany({ where: { schoolId: school.id } });
  if (seed.achievements?.length) {
    await prisma.schoolAchievement.createMany({
      data: seed.achievements.map((achievement) => ({ schoolId: school.id, ...achievement }))
    });
  }

  return school;
}

async function main() {
  // ── Admin user ─────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { phone: ADMIN_PHONE },
    update: { name: ADMIN_NAME, role: "admin" },
    create: { phone: ADMIN_PHONE, name: ADMIN_NAME, role: "admin" },
  });

  const state = await prisma.state.upsert({
    where: { slug: stateSeed.slug },
    update: { name: stateSeed.name },
    create: stateSeed
  });

  for (const city of citySeeds) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: { name: city.name, hasSchools: city.hasSchools, stateId: state.id },
      create: { ...city, stateId: state.id }
    });
  }

  for (const board of boardSeeds) {
    await prisma.board.upsert({
      where: { slug: board.slug },
      update: { name: board.name },
      create: board
    });
  }

  for (const facility of facilitySeeds) {
    await prisma.facility.upsert({
      where: { slug: facility.slug },
      update: { name: facility.name, icon: facility.icon },
      create: facility
    });
  }

  for (const seed of schoolSeeds) {
    await upsertSchool(seed, state.id);
  }

  const blogSeeds = [
    {
      slug: "prayagraj-school-admission-guide-2025",
      title: "School Admission in Prayagraj 2025 — Complete Guide",
      content:
        "<p>Documents, timeline, and fees — everything first-time applicants need to know. Start by preparing Aadhaar, birth certificate, and previous class results before you visit shortlisted schools.</p><h2>Required documents</h2><p>Most schools ask for residence proof, passport-size photos, and TC if applicable. Always carry originals and photocopies.</p>",
      author: "SchoolSetu Editorial",
      seo_title: "Prayagraj School Admission 2025 — Documents & Timeline",
      seo_description:
        "Complete guide to school admission in Prayagraj: documents, timelines, and fee ranges for CBSE and UP Board.",
      publishedAt: new Date("2025-01-15T10:00:00.000Z"),
    },
    {
      slug: "cbse-vs-up-board-prayagraj",
      title: "CBSE vs UP Board — An Honest Comparison for Prayagraj Parents",
      content:
        "<p>Choosing between CBSE and UP Board depends on medium, fees, and your child&#39;s goals. CBSE aligns well with national competitive exams while UP Board suits tight budgets with strong Hindi foundations.</p><h2>Quick takeaways</h2><p>Compare monthly fees, language of instruction, and transfer flexibility before deciding.</p>",
      author: "SchoolSetu Editorial",
      seo_title: "CBSE vs UP Board in Prayagraj",
      seo_description:
        "A practical comparison of CBSE and UP Board schools in Prayagraj for parents balancing cost and curriculum.",
      publishedAt: new Date("2025-01-20T12:00:00.000Z"),
    },
    {
      slug: "top-hostel-schools-prayagraj",
      title: "Top Hostel Schools in Prayagraj — Fees and Facilities 2025",
      content:
        "<p>Boarding schools can offer discipline and focused academics when day schools are impractical. Visit hostels in person and speak with current parents about food, safety, and weekend policies.</p><h2>What to inspect</h2><p>Check medical support, CCTV coverage, visitation rules, and how often children can speak with guardians.</p>",
      author: "SchoolSetu Editorial",
      seo_title: "Best Hostel Schools in Prayagraj",
      seo_description:
        "Fees, hostel facilities, and safety checklist for parents evaluating boarding schools around Prayagraj.",
      publishedAt: new Date("2025-02-01T09:30:00.000Z"),
    },
  ];

  for (const b of blogSeeds) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        content: b.content,
        author: b.author,
        seoTitle: b.seo_title,
        seoDescription: b.seo_description,
        publishedAt: b.publishedAt,
      },
      create: {
        slug: b.slug,
        title: b.title,
        content: b.content,
        author: b.author,
        seoTitle: b.seo_title,
        seoDescription: b.seo_description,
        publishedAt: b.publishedAt,
      },
    });
  }

  console.log("\n------------------------------------------------------------");
  console.log("  Seed completed");
  console.log("    5 cities, 5 boards, 13 facilities, 7 approved schools");
  console.log("------------------------------------------------------------");
  console.log(`Admin seeded. Login phone: ${ADMIN_PHONE}`);
  console.log(`  Name : ${ADMIN_NAME}`);
  console.log("  URL  : http://localhost:3000/auth/parent/login");
  console.log("  Flow : Enter phone -> receive OTP -> verify -> /admin");
  if (ADMIN_PHONE.includes("X")) {
    console.log("\n  WARNING: Replace ADMIN_PHONE in seed.ts with a real");
    console.log("  number before you can log in. Re-run `npm run seed`.");
  }
  console.log("------------------------------------------------------------\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

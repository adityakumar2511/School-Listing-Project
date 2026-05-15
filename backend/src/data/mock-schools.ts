import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export const schoolInclude = {
  city: {
    include: {
      state: true
    }
  },
  board: true,
  details: true,
  address: true,
  academics: true,
  fees: true,
  facilities: true,
  gallery: {
    orderBy: {
      order: "asc"
    }
  },
  sections: {
    orderBy: {
      order: "asc"
    }
  },
  achievements: true,
  featuredListings: true
} satisfies Prisma.SchoolInclude;

const facilityFieldBySlug: Record<string, keyof Prisma.SchoolFacilitiesWhereInput> = {
  library: "library",
  labs: "labs",
  hostel: "hostel",
  transport: "transport",
  "smart-classroom": "smartClassroom",
  wifi: "wifi",
  cctv: "cctv",
  gym: "gym",
  "swimming-pool": "swimmingPool",
  playground: "playground",
  auditorium: "auditorium",
  cafeteria: "cafeteria"
};

function normalizeBoardSlug(board: string) {
  return board.trim().toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
}

function normalizeCategorySlug(category: string) {
  return category.trim().toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
}

export type SchoolListFilters = {
  q?: string;
  city?: string;
  board?: string;
  facility?: string;
  category?: string;
  featured?: boolean;
  admissionOpen?: boolean;
};

export function buildSchoolWhere(filters: SchoolListFilters): Prisma.SchoolWhereInput {
  const where: Prisma.SchoolWhereInput = {
    status: "approved",
    ...(filters.featured ? { isFeatured: true } : {}),
    ...(filters.admissionOpen ? { academics: { admissionOpen: true } } : {})
  };
  const andFilters: Prisma.SchoolWhereInput[] = [];

  if (filters.q) {
    andFilters.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { city: { name: { contains: filters.q, mode: "insensitive" } } },
        { city: { slug: { contains: filters.q, mode: "insensitive" } } },
        { board: { name: { contains: filters.q, mode: "insensitive" } } },
        { address: { city: { contains: filters.q, mode: "insensitive" } } }
      ]
    });
  }

  if (filters.city) {
    where.city = {
      slug: filters.city
    };
  }

  if (filters.board) {
    const boardSlug = normalizeBoardSlug(filters.board);
    where.board = {
      OR: [
        { slug: filters.board },
        { slug: boardSlug },
        { name: { equals: filters.board.replaceAll("_", " "), mode: "insensitive" } }
      ]
    };
  }

  if (filters.facility) {
    const facilityField = facilityFieldBySlug[filters.facility];
    if (facilityField) {
      where.facilities = {
        [facilityField]: true
      };
    }
  }

  if (filters.category) {
    const categorySlug = normalizeCategorySlug(filters.category);

    if (categorySlug === "girls") {
      where.type = {
        contains: "girls",
        mode: "insensitive"
      };
    } else if (categorySlug === "hostel") {
      andFilters.push({
        OR: [
          { facilities: { hostel: true } },
          { sections: { some: { sectionType: { in: ["hostel"] } } } }
        ]
      });
    } else if (categorySlug === "sports") {
      andFilters.push({
        OR: [
          { facilities: { playground: true } },
          { facilities: { gym: true } },
          { facilities: { swimmingPool: true } },
          { sections: { some: { sectionType: { in: ["sports"] } } } }
        ]
      });
    } else {
      where.sections = {
        some: {
          sectionType: {
            in: [categorySlug, categorySlug.replaceAll("-", "_")]
          }
        }
      };
    }
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  return where;
}

export type SchoolSort = "relevance" | "fee-asc" | "fee-desc";

function buildOrderBy(sort?: SchoolSort): Prisma.SchoolOrderByWithRelationInput[] {
  if (sort === "fee-asc") {
    return [{ fees: { tuitionFeeMonthly: "asc" } }];
  }
  if (sort === "fee-desc") {
    return [{ fees: { tuitionFeeMonthly: "desc" } }];
  }
  return [{ isFeatured: "desc" }, { createdAt: "desc" }];
}

export async function findSchools(
  filters: SchoolListFilters,
  page: number,
  limit: number,
  sort?: SchoolSort
) {
  const where = buildSchoolWhere(filters);
  const skip = (page - 1) * limit;

  const [data, total] = await prisma.$transaction([
    prisma.school.findMany({
      where,
      include: schoolInclude,
      orderBy: buildOrderBy(sort),
      skip,
      take: limit
    }),
    prisma.school.count({ where })
  ]);

  return { data, total };
}

export type SchoolListItem = Awaited<ReturnType<typeof findSchools>>["data"][number];

export function findSchoolBySlug(slug: string) {
  return prisma.school.findFirst({
    where: {
      slug,
      status: "approved"
    },
    include: schoolInclude
  });
}

export const mockSchools: never[] = [];

import type { NormalizedSchool } from "@/lib/schools-api";

export type SchoolSectionItem = {
  title: string;
  content: string;
  sectionType: string;
};

export type SchoolAchievementItem = {
  title: string;
  year?: number | null;
  description?: string | null;
};

export type SchoolProfile = Omit<NormalizedSchool, "medium"> & {
  area: string;
  pincode: string;
  classesFrom: string;
  classesTo: string;
  schoolType: string;
  gender: string;
  medium: string[];
  admissionClasses: string[];
  specialFocus: string[];
  isVerified: boolean;
  coverImage?: string;
  tagline?: string;
  principalName?: string;
  facilityMap: Record<string, boolean>;
  galleryImages: string[];
  boardsOffered: string[];
  streams: string[];
  documentsRequired: string[];
  ageCriteria?: string;
  admissionStart?: string | null;
  admissionEnd?: string | null;
  contentSections: SchoolSectionItem[];
  achievements: SchoolAchievementItem[];
};

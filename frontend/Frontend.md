# SchoolSetu Frontend Documentation

This document explains the Next.js frontend for SchoolSetu. It covers the current implementation, route behavior, component contracts, design system, state, data fetching, and known gaps.

## Purpose

The frontend is the parent-facing and operator-facing web application for SchoolSetu. It lets parents discover schools in Tier-2 and Tier-3 Indian cities, browse school detail pages, compare up to three schools, request admission inquiries, and use an AI recommendation assistant. It also contains admin and dashboard shells.

| User | Frontend experience |
| --- | --- |
| Parents | Search `/schools/[city]`, inspect `/schools/[slug]`, compare schools, use `/ai-recommend`, start admission inquiries via WhatsApp or an inline form. |
| Schools | Visit `/for-schools`, register/login at `/auth/school/login`, and eventually manage `/school/dashboard`. |
| Platform admins | Use `/admin` and `/admin/audit-logs` for operations and audit review once backend workflows are complete. |

## Tech Stack

| Package | Version range | Why it was chosen |
| --- | --- | --- |
| `next` | `^16.0.3` | App Router gives SSR/SSG, route-level metadata, static SEO pages, server/client component boundaries. |
| `react`, `react-dom` | `^19.2.0` | Core UI layer for cards, forms, chat, dashboards, and layouts. |
| `typescript` | `^5.9.3` | Type-safe route params, school data shapes, component props, and API normalization. |
| `tailwindcss` | `^4.1.17` | Token-driven styling from `globals.css`, responsive layout primitives, fast UI iteration. |
| `react-icons` | latest | Feather (`fi`), Material (`md`), and Heroicons (`hi`) icon sets. Replaces all emojis in UI. |
| `@tanstack/react-query` | `^5.90.10` | Server-state lifecycle for school listings: loading, placeholder data, refetching, error handling. |
| `zustand` | `^5.0.8` | Small client store for the compare shortlist. |
| `framer-motion` | `^12.23.24` | Lightweight animation for AI chat messages. |
| `zod` | `^4.1.12` | Runtime validation schemas for inquiry and auth forms. |
| `react-hook-form` | `^7.66.0` | Efficient form state with minimal rerenders and Zod integration. |
| `@hookform/resolvers` | `^5.2.2` | Bridges Zod schemas into React Hook Form. |
| `lucide-react` | `^0.554.0` | Icon set used in `inquiry-form.tsx` (CheckCircle2, Loader2, Send, AlertTriangle). |
| `class-variance-authority` | `^0.7.1` | Variant system for the shared `Button`. |
| `clsx`, `tailwind-merge` | latest | Safe class composition through `lib/utils.ts`. |
| `next-auth` | `^4.24.11` | Installed for planned Google OAuth integration. Not yet wired. |
| `@radix-ui/react-slot` | `^1.2.4` | Enables `Button asChild` for link-as-button without nested element issues. |

## Complete File Structure

```text
frontend/
|-- Frontend.md
|-- package.json
|-- tsconfig.json
|-- next.config.ts
|-- postcss.config.mjs
|-- eslint.config.mjs
|-- public/
|   |-- school-logo.svg
|-- data/
|   |-- schools.ts
|-- lib/
|   |-- auth-token.ts
|   |-- schools-api.ts
|   |-- utils.ts
|-- store/
|   |-- compare-store.ts
|-- components/
|   |-- ai/
|   |   |-- ai-chat.tsx
|   |-- inquiry/
|   |   |-- inquiry-form.tsx
|   |-- schools/
|   |   |-- hero-search.tsx
|   |   |-- mobile-sticky-bar.tsx
|   |   |-- school-card.tsx
|   |   |-- school-inquiry-cta.tsx
|   |   |-- search-panel.tsx
|   |-- ui/
|   |   |-- badge.tsx
|   |   |-- button.tsx
|   |   |-- card.tsx
|   |-- providers.tsx
|   |-- site-footer.tsx
|   |-- site-header.tsx
|-- app/
    |-- globals.css
    |-- layout.tsx
    |-- admin/
    |   |-- page.tsx
    |   |-- audit-logs/page.tsx
    |   |-- [section]/page.tsx
    |-- dashboard/page.tsx
    |-- school/dashboard/page.tsx
    |-- (public)/
        |-- page.tsx
        |-- about/page.tsx
        |-- ai-recommend/page.tsx
        |-- auth/
        |   |-- login/page.tsx
        |   |-- parent/login/page.tsx
        |   |-- parent/login/parent-login-form.tsx
        |   |-- school/login/page.tsx
        |   |-- school/login/school-login-form.tsx
        |   |-- register/page.tsx
        |   |-- verify-otp/page.tsx
        |-- blog/
        |   |-- page.tsx
        |   |-- [slug]/page.tsx
        |-- compare/page.tsx
        |-- contact/page.tsx
        |-- for-schools/page.tsx
        |-- privacy-policy/page.tsx
        |-- terms-of-service/page.tsx
        |-- schools/
            |-- page.tsx
            |-- schools-listing-client.tsx
            |-- [slug]/page.tsx
            |-- board/[board]/page.tsx
            |-- category/[category]/page.tsx
            |-- state/[state]/page.tsx
```

### File explanations

| File or folder | What it contains and does |
| --- | --- |
| `data/schools.ts` | Core `School` type, `NormalizedSchool` alias, typed constants (`BOARDS`, `TARGET_CITIES`, `SCHOOL_TYPES`, `GENDERS`, `MEDIUMS`, `FEE_RANGES`, `SPECIAL_FOCUS_OPTIONS`), 5 detailed mock schools, and helper functions: `getSchoolsByCity`, `getSchoolBySlug`, `getFeaturedSchools`, `getAdmissionOpenSchools`, `filterSchools`. |
| `lib/auth-token.ts` | `getAuthToken`, `setAuthToken`, `clearAuthToken`, and `authHeaders()` using localStorage key `schoolsetu_token`. All token operations for API calls. |
| `lib/schools-api.ts` | `NormalizedSchool` type (flattened school shape for UI), `normalizeSchool` function, and API fetchers: `fetchSchoolsList`, `fetchSchoolBySlug`. Used by all school-rendering components. |
| `lib/utils.ts` | `cn()` class merging helper and `formatCurrency()` for INR formatting. |
| `store/compare-store.ts` | Zustand compare store with `selectedIds`, `toggleSchool`, and `clear`. Limits selection to three schools. |
| `components/providers.tsx` | `QueryClientProvider` with `staleTime: 60_000` and `refetchOnWindowFocus: false`. |
| `components/site-header.tsx` | **Client component.** Sticky navigation with brand, public nav links, login CTA. Mobile hamburger menu with slide-down drawer, closes on route change or outside click. |
| `components/site-footer.tsx` | Footer with brand copy, target city links, and company links. |
| `components/ui/button.tsx` | Button primitive with variants `default`, `amber`, `outline`, `ghost`. Supports `asChild`. |
| `components/ui/badge.tsx` | Badge primitive with tones `blue`, `amber`, `success`, `neutral`, `danger`. |
| `components/ui/card.tsx` | White card with `rounded-[12px]`, border, and padding. |
| `components/schools/hero-search.tsx` | **Client component.** Homepage search bar with city badge. Pushes to `/schools/prayagraj?q=...` on submit or Enter. |
| `components/schools/mobile-sticky-bar.tsx` | **Client component.** Fixed bottom bar on school detail pages (mobile only). Call, WhatsApp, and Inquiry buttons. |
| `components/schools/school-card.tsx` | School listing card. Accepts `NormalizedSchool`. Renders image, badges, name, city, description, facilities, fee, compare toggle, WhatsApp link, inquiry link. |
| `components/schools/search-panel.tsx` | Search/filter form. Pushes `/schools` query params via `useRouter`. |
| `components/schools/school-inquiry-cta.tsx` | **Client component.** Sidebar CTA on school detail pages. WhatsApp button, divider "or", inline `InquiryForm` toggle. Shows admission open/closed badge and quick info strip. |
| `components/inquiry/inquiry-form.tsx` | Zod + React Hook Form admission inquiry form. Authenticated API submission to `POST /api/inquiries`. Pre-fills phone from JWT. Handles success, duplicate (409), and error states. All labels in English. |
| `components/ai/ai-chat.tsx` | AI recommendation chat UI. POSTs to `/api/ai/recommend`, shows typing indicator, error state, and recommendation cards. |
| `app/layout.tsx` | Root layout with Google fonts, global metadata, providers, header, and footer. |
| `app/globals.css` | Tailwind import, CSS design tokens, body defaults, and `.container-shell`. |
| `app/admin/page.tsx` | Admin dashboard landing. Links to all admin sections including `audit-logs`. |
| `app/admin/audit-logs/page.tsx` | **Client component.** Full audit log viewer for admins. Stats bar (4 cards), filter row (search/action/date range/reset), color-coded table, red-row highlight for `SCHOOL_DELETED`, "View Changes" button opens side-drawer diff viewer, CSV export. |
| `app/admin/[section]/page.tsx` | Generic admin section shell. |
| `app/(public)/page.tsx` | **Server component.** 8-section parent homepage. All icons via React Icons. No emojis. Data from `getFeaturedSchools()` and `getAdmissionOpenSchools()`. |
| `app/(public)/auth/login/page.tsx` | Role selector. Two cards: "Parent Login" → `/auth/parent/login` and "School Admin Login" → `/auth/school/login`. |
| `app/(public)/auth/parent/login/page.tsx` | Server component. Renders `ParentLoginForm`. |
| `app/(public)/auth/parent/login/parent-login-form.tsx` | **Client component.** Google Sign-In button (with dev warning) and Phone OTP flow (send phone, enter 6-digit OTP, resend countdown). |
| `app/(public)/auth/school/login/page.tsx` | Server component. Renders `SchoolLoginForm`. |
| `app/(public)/auth/school/login/school-login-form.tsx` | **Client component.** Tab switcher: Email/Password (primary) and Phone OTP. Email field with show/hide password toggle. |
| `app/(public)/auth/register/page.tsx` | Registration with parent/school role selection and OTP flow. |
| `app/(public)/auth/verify-otp/page.tsx` | OTP verification with 6-input boxes, shake animation on error, resend timer. |
| `app/(public)/blog/page.tsx` | Blog listing page with featured post and grid. English copy. |
| `app/(public)/blog/[slug]/page.tsx` | 3 static SEO articles: admission guide, CBSE vs UP Board, hostel schools review. `generateStaticParams`, per-post `generateMetadata`. All content in professional English. |
| `app/(public)/for-schools/page.tsx` | School-facing landing page. 5 sections: hero, benefits (4 cards with icons), how it works (3 steps), what's included (checklist), final CTA. |
| `app/(public)/schools/schools-listing-client.tsx` | **Client component.** Sidebar filter panel + school grid. Filters: search text, board, gender, fee range, facilities, special focus. Sort: relevance, fee asc/desc, newest. Empty state with "No Schools Found". |
| `app/(public)/schools/[slug]/page.tsx` | Dual-purpose server page. City slug → city header + stats strip + `SchoolsListingClient`. School slug → full 2-column detail layout (main column + sticky sidebar). JSON-LD for both. |

## Route Architecture

### Public routes

| Route | What it renders | Key components |
| --- | --- | --- |
| `/` | 8-section homepage for discovery. | `HeroSearch`, `SchoolCard`, guide cards, category grid. |
| `/schools/[city]` | City listing page with stats strip + client filters. | `SchoolsListingClient`, JSON-LD ItemList. |
| `/schools/[slug]` | School detail: header, quick stats, actions, about, fees, facilities, programs, nearby schools. | `SchoolInquiryCta`, `MobileStickyBar`, `Badge`. |
| `/schools/board/[board]` | Board SEO landing. | School cards. |
| `/schools/category/[category]` | Category SEO landing. | School cards. |
| `/schools/state/[state]` | State SEO landing. | School cards. |
| `/ai-recommend` | AI recommendation assistant. | `AiChat`. |
| `/compare` | Compare up to 3 schools. | `useCompareStore`, school data. |
| `/blog` | Blog listing with featured post. | `Badge`, post cards. |
| `/blog/[slug]` | Static article with structured content. | `ArticleH2`, `ArticleP`, `ArticleUl`, `ArticleTable`, `ArticleCta`. |
| `/for-schools` | School onboarding value proposition. | React Icons, CTA buttons. |
| `/about`, `/contact`, `/privacy-policy`, `/terms-of-service` | Static content pages. | Shared layout. |

### Auth routes

| Route | What it renders |
| --- | --- |
| `/auth/login` | Role selector (parent or school admin). |
| `/auth/parent/login` | Parent login: Google Sign-In + Phone OTP. |
| `/auth/school/login` | School admin login: Email/Password + Phone OTP. |
| `/auth/register` | Registration with role selection. |
| `/auth/verify-otp` | OTP entry with 6-box inputs and resend timer. |

### Dashboard & admin routes

| Route | What it renders |
| --- | --- |
| `/dashboard` | Parent dashboard shell. |
| `/school/dashboard` | School dashboard shell. |
| `/admin` | Admin overview with section links. |
| `/admin/audit-logs` | Full audit log viewer (stats, filters, table, diff drawer, CSV export). |
| `/admin/[section]` | Generic admin section shell. |

## Component Documentation

### `components/schools/hero-search.tsx`

Client component. Controlled input with `useState`. On submit or Enter keypress, pushes to `/schools/prayagraj?q=<query>`. Shows `📍 Prayagraj` badge and a "Search Schools" button.

### `components/schools/mobile-sticky-bar.tsx`

Client component. Fixed bottom bar (`fixed bottom-0`), hidden on `md+`. Three buttons: Call (tel link), WhatsApp (wa.me link), Inquiry (scroll to `#inquiry`).

### `components/schools/school-inquiry-cta.tsx`

Props: `{ schoolId, schoolName, phone, whatsapp, board, monthlyFee, classesFrom, classesTo, admissionOpen, admissionClasses }`.

Renders:
- Header with "Send Admission Inquiry" and admission open/closed badge.
- Quick info strip: Monthly Fee, Board, Classes.
- Full-width WhatsApp button.
- Divider "or".
- "Fill Inquiry Form" toggle button — mounts `InquiryForm` inline.
- Phone call link below.

### `components/inquiry/inquiry-form.tsx`

Props: `{ schoolId, schoolName, admissionClasses?, onSuccess? }`.

Fields:
| Field | Label | Validation |
| --- | --- | --- |
| `parentName` | Parent's Name | Required, min 2 chars. |
| `phone` | Phone number (WhatsApp) | Required, 10 digits. Pre-filled from JWT. |
| `childName` | Child's Name | Required, min 2 chars. |
| `classApplying` | Class Applying For | Required. |
| `message` | Message (optional) | Max 300 chars. |

States: unauthenticated (login prompt), success, duplicate 409, generic error, form.

Submission: `POST /api/inquiries` with `authHeaders()`.

### `components/ai/ai-chat.tsx`

POSTs `{ preferences }` to `${NEXT_PUBLIC_API_URL}/api/ai/recommend`. Shows typing indicator, error alert, and recommendation cards with board badge, school name, city, classes, fee, and "View school" CTA.

### `components/ui/button.tsx`

Variants: `default` (blue), `amber` (CTA), `outline` (secondary), `ghost` (tertiary).
Sizes: `default` (`h-11 px-5`), `sm` (`h-9 px-3`), `lg` (`h-12 px-6`).
Supports `asChild` via Radix Slot.

### `components/ui/badge.tsx`

Tones: `blue` (board/info), `amber` (featured), `success` (admission open), `neutral` (type), `danger` (admission closed/error).

### `components/site-header.tsx`

Client component. Hamburger button visible on mobile. `useState` for menu open state. `useEffect` with `useRef` to close on outside click. `usePathname` to close on route change. Desktop nav links: Schools, AI Advisor, Compare, For Schools.

### `app/admin/audit-logs/page.tsx`

Action badge config (`ACTION_CONFIG`) maps each `AuditAction` to a label, color, icon, and optional `danger: true` flag. Danger rows get `bg-red-50 border-l-4 border-red-400`. `DiffDrawer` component shows changed keys only in a red/green side-by-side diff. CSV export fetches all matching records and triggers a browser download.

## Data Layer

### `data/schools.ts`

The primary mock data source used for static rendering, SSG, and fallback when the API is unreachable.

Key exports:
- `School` — full richly-typed school interface.
- `BOARDS`, `TARGET_CITIES`, `SCHOOL_TYPES`, `GENDERS`, `MEDIUMS`, `FEE_RANGES`, `SPECIAL_FOCUS_OPTIONS` — typed constants.
- `mockSchools` — 5 detailed Prayagraj schools.
- `filterSchools(params)` — client-side filter function used by `SchoolsListingClient`.
- `getFeaturedSchools()`, `getAdmissionOpenSchools()` — used by the homepage server component.

### `lib/schools-api.ts`

`NormalizedSchool` is the single flattened type consumed by all UI components. Both API responses (nested Prisma) and mock school objects are passed through `normalizeSchool()` before rendering. This prevents shape drift as the backend evolves.

```ts
type NormalizedSchool = {
  id: string; name: string; slug: string; city: string; citySlug: string;
  board: string; type: string; classes: string; description: string;
  image: string; phone: string; whatsapp: string; address: string;
  monthlyFee: number; annualFee: number; admissionFee: number;
  transportFee: number; hostelFee: number; admissionOpen: boolean;
  isFeatured: boolean; facilities: string[]; establishedYear?: number;
  affiliationNo?: string; medium: string | string[];
};
```

### `lib/auth-token.ts`

All API calls that require authentication use `authHeaders()`:

```ts
authHeaders() → { Authorization: "Bearer <token>", "Content-Type": "application/json" }
```

Token is stored in `localStorage` under key `schoolsetu_token`.

## Design System

### Color tokens (defined in `app/globals.css`)

| Token | Hex | Use |
| --- | --- | --- |
| Background | `#F1EFE8` | Page background, section fills. |
| Text primary | `#2C2C2A` | Body text, card titles. |
| Primary blue | `#185FA5` | Actions, icons, focus rings, key labels. |
| Dark blue | `#0C447C` | Section headings, hover states. |
| Deep blue | `#042C53` | Hero titles, admin headings. |
| Light blue | `#E6F1FB` | Info chip backgrounds, hover fills. |
| Amber CTA | `#EF9F27` | Admission and conversion CTAs. |
| Amber light | `#FAEEDA` | Featured badges, article CTAs. |
| Amber dark | `#633806` | Text on amber surfaces. |
| Border | `#D3D1C7` | Cards, inputs, section dividers. |
| Muted text | `#55534e`, `#888780` | Secondary copy, metadata. |
| Success | `#3B6D11` on `#EAF3DE` | Admission open, positive states. |
| Danger | `#A32D2D` on `#FCEBEB` | Errors, admission closed. |

### Typography

| Font | Variable | Use |
| --- | --- | --- |
| Plus Jakarta Sans | `--font-plus-jakarta` | Headings, brand, card titles, page titles. |
| Inter | `--font-inter` | Body, inputs, buttons, metadata, forms. |

Usage: `font-heading` for page and section titles. Body font for operational UI. No viewport-scaled font sizes.

### Layout

- Page content: `.container-shell` — `min(1180px, calc(100vw - 32px))`.
- Vertical rhythm: sections typically start with `py-16`.
- School card grids: `md:grid-cols-2` or `lg:grid-cols-3`.
- Admin/stat grids: `lg:grid-cols-4`.

### Icons

All icons use `react-icons`. No emojis in UI text.

- `react-icons/fi` — Feather icons (Search, ArrowRight, Check, Edit, Trash, Download, etc.).
- `react-icons/md` — Material icons (School, Science).
- `react-icons/hi` — Heroicons outline (AcademicCap, OfficeBuilding, UserGroup, CurrencyRupee, DocumentText).

## State Management

### Zustand compare store (`store/compare-store.ts`)

```ts
type CompareState = {
  selectedIds: string[];
  toggleSchool: (id: string) => void;
  clear: () => void;
};
```

`toggleSchool` appends or removes an id; new selections sliced to `.slice(-3)`. `SchoolCard` reads `selectedIds` and calls `toggleSchool`.

## Data Fetching Strategy

### TanStack Query

Global `QueryClient` with `staleTime: 60_000` and `refetchOnWindowFocus: false`.

`SchoolsListingClient` uses local `filterSchools()` from `data/schools.ts` with `useMemo` (client-side filtering, no async query needed for mock data). For API-backed listings, `fetchSchoolsList` from `lib/schools-api.ts` uses `NEXT_PUBLIC_API_URL`.

### Fallback chain

1. `fetchSchoolBySlug` calls `GET /api/schools/:slug`.
2. Falls back to `mockSchools.find(s => s.slug === slug)`.
3. Both paths go through `normalizeSchool()` before rendering.

### Audit log page fetching

Uses `fetch` with `authHeaders()` directly (no TanStack Query). `fetchLogs` and `fetchStats` run in parallel on mount and when any filter changes. Stats are non-critical — their failure is silently swallowed.

## Forms

Pattern used across all forms:

1. Define Zod schema.
2. Derive TypeScript type with `z.infer`.
3. Create React Hook Form instance with `zodResolver`.
4. Render validation errors inline.
5. Submit through `useMutation` or direct `fetch`.

Example (`inquiry-form.tsx`):

```ts
const inquirySchema = z.object({
  parentName: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  childName: z.string().trim().min(2, "Enter student's name"),
  classApplying: z.string().min(1, "Select the class applying for"),
  message: z.string().trim().max(300, "Message cannot exceed 300 characters").optional()
});
```

## SEO Implementation

- `app/layout.tsx` — global `metadata` with title template and `metadataBase`.
- `app/(public)/schools/[slug]/page.tsx` — `generateMetadata()` for city and school slugs.
- `app/(public)/blog/[slug]/page.tsx` — `generateMetadata()` per article.
- School detail pages: JSON-LD `School` schema.
- City pages: JSON-LD `ItemList` schema.
- `generateStaticParams()` on both `[slug]/page.tsx` files.
- All metadata in professional English.

## Known Limitations and Next Steps

| Limitation | Why it matters | Next step |
| --- | --- | --- |
| `schools/[slug]` is dual-purpose | Next.js cannot have sibling dynamic routes at the same path level. | Keep city-first slug matching and maintain unique city/school slugs. |
| Auth.js integration pending | Parent login has Google button with dev warning box; school login uses email/password UI. Neither is fully wired to a production provider. | Configure NextAuth providers and bridge to backend JWT. |
| Audit log page requires admin JWT | The page fetches from `authHeaders()` but there is no server-side redirect guard. | Add server-side session check or middleware redirect for non-admin users. |
| Prisma AuditLog migration | `AuditLog` model exists in schema but the migration needs to be run against the hosted database. | Run `npx prisma migrate dev --name add_audit_log` when DB is accessible. |
| ISR not configured | SEO pages use static generation with no revalidation interval. | Add `export const revalidate = 3600` to city/school pages. |
| Admin dashboards are shells | Admin API routes exist; frontend shells are not connected moderation tools. | Connect to `PendingUpdate`, `ApprovalLog`, schools, and payments APIs. |

## Local Development Commands

```bash
npm run dev --workspace frontend
npm run typecheck --workspace frontend
npm run build --workspace frontend
```

The frontend runs at `http://localhost:3000`. Ensure `NEXT_PUBLIC_API_URL=http://localhost:4000` is set in `frontend/.env.local`.

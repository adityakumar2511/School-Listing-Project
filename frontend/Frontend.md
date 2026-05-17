# SchoolSetu Frontend Documentation

Next.js App Router frontend for discovery, inquiries, dashboards, admin tools, blog, and sitemap generation. Backend base URL **`NEXT_PUBLIC_API_URL`** → `fetch` for schools, inquiries, moderation, audit logs, cities, blogs, etc. Define client/server env values in **`frontend/.env`** (e.g. **`NEXT_PUBLIC_API_URL`**, **`JWT_SECRET`** for middleware).

---

## Purpose

| Audience | What ships today |
| --- | --- |
| **Parents** | Home (API-driven featured + admission lists), school listing/filter/sort (**`fetchSchoolsList`**), compare, OTP login, **`/dashboard`**, **`InquiryForm`** → **`POST /api/inquiries`**, AI chat, static marketing pages, **blog list/detail from API**. |
| **Schools** | **`/auth/school/login`**, **`/auth/school/register`**, **`/school/dashboard`** (inquiries table + tabs to submit profile/gallery/sections updates via **`PUT /api/schools/:id`**), OTP + optional email/password form where implemented. |
| **Admins** | **`/admin`** and dedicated routes (schools, pending, moderation, inquiries, audit logs, cities, featured, blog, plus placeholder-style **SEO**, **Analytics**, **Payments** shells). Middleware enforces **admin** JWT for **`/admin/*`**. |

---

## Tech stack

| Package | Role |
| --- | --- |
| `next` | App Router, `sitemap.ts`, metadata |
| `react` / `react-dom` | UI |
| `typescript` | Typing throughout |
| `tailwindcss` | Styling (`globals.css` tokens) |
| `@tanstack/react-query` | Server state (listings, admin fetches, mutations) |
| `zustand` | Compare shortlist (**`compare-store.ts`**) |
| `react-hook-form` + `@hookform/resolvers` + `zod` | Forms (inquiries, dashboards) |
| `react-icons` | Icons (**no `lucide-react` dependency**) |
| `@radix-ui/react-slot` | Button `asChild` |
| **`@radix-ui/react-tabs`** | Tab UIs (e.g. school detail, dashboard) |
| `framer-motion` | Lightweight motion |
| **`jose`** | Edge **`middleware.ts`** verifies JWT (**requires `JWT_SECRET` on the Next server**) |
| `next-auth` | Google session path on parent login bridge; OTP remains primary |

---

## Route guard (`middleware.ts`)

 Matcher: **`/admin/*`**, **`/school/dashboard/*`**, **`/dashboard/*`**.

- Reads cookie **`schoolsetu_token`** (set by **`setAuthToken`** next to **`localStorage`**).
- Verifies JWT with **`process.env.JWT_SECRET`** (must match backend **`JWT_SECRET`**).
- **`/admin`**: must be **`role === "admin"`**.
- **`/school/dashboard`**: **`school`** or **`admin`**.
- **`/dashboard`**: parents; **`admin`** redirected to **`/admin`**, **`school`** to **`/school/dashboard`**.

Missing secret → middleware cannot admit users (token verify fails).

---

## Directory highlights

```text
frontend/
├── Frontend.md
├── package.json
├── middleware.ts              # JWT + role gates
├── next.config.ts
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── sitemap.ts             # aggregates schools/cities/boards/blog from API
│   ├── admin/
│   │   ├── page.tsx           # hub + overview queries
│   │   ├── audit-logs/
│   │   ├── blog/
│   │   ├── cities/
│   │   ├── featured/
│   │   ├── inquiries/
│   │   ├── moderation/
│   │   ├── analytics/         # copy: wire GA / PostHog via env — not verified here
│   │   ├── seo/               # explains Prisma `seo_pages` — no CRUD UI
│   │   ├── payments/          # aligns with backend 503 payments
│   │   ├── users/
│   │   └── schools/, schools/add/, schools/pending/
│   ├── dashboard/             # parent dashboard client
│   ├── school/dashboard/       # owner dashboard client
│   ├── api/auth/[...nextauth]/
│   └── (public)/
│       ├── page.tsx            # homepage uses fetchSchoolsList
│       ├── ai-recommend/
│       ├── about/, contact/, for-schools/
│       ├── privacy-policy/, terms-of-service/
│       ├── compare/
│       ├── blog/, blog/[slug]/ # fetchPublishedBlogPosts / fetchBlogPostBySlug
│       ├── auth/login/, register/, verify-otp/
│       └── auth/
│           ├── parent/login/
│           └── school/login/, school/register/
│       └── schools/
│           ├── page.tsx
│           ├── schools-listing-client.tsx
│           ├── [slug]/        # tabs + inquiry CTA (+ map embed when coords exist)
│           ├── board/[board]/
│           ├── category/[category]/
│           └── state/[state]/
├── components/
│   ├── ai/ai-chat.tsx
│   ├── inquiry/inquiry-form.tsx
│   ├── schools/               # hero-search, cards, tabs, inquiry CTA, …
│   ├── ui/                    # button, card, badge, tabs
│   ├── providers.tsx
│   ├── site-header.tsx, site-footer.tsx
├── lib/
│   ├── auth-token.ts           # localStorage + cookie helpers; authHeaders()
│   ├── schools-api.ts          # API_URL, fetchSchoolsList, fetchSchoolBySlug, normalizer
│   ├── blog-api.ts             # Published posts + slug fetch
│   └── utils.ts                # cn(), formatCurrency
├── store/compare-store.ts
└── data/schools.ts             # Static types/filter helpers/list fallbacks — not sole data source where API wired
```

---

## Data fetching

### Schools (`lib/schools-api.ts`)

- **`API_URL`** defaults to **`http://localhost:4000`**.
- **`fetchSchoolsList(params)`** — **`GET /api/schools`**, merges query string (includes **`limit`**, **`page`**, **`sort=newest`**, boards, admission, featured, …).
- **`fetchSchoolBySlug(slug)`** — **`GET /api/schools/:slug`**.
- Responses normalized to **`NormalizedSchool`** / **`NormalizedSchoolDetail`** shapes for listing + detail consumers.

Used by homepage, listings, routed pages (`board`, `state`, `category`, detail), **`sitemap.ts`**.

### Blog (`lib/blog-api.ts`)

- **`GET /api/admin/blog`** and **`GET /api/admin/blog/:slug`** match backend public mounts.
- **`revalidate = 3600`** on **`app/(public)/blog/*`** aligns with ISR-style refresh.

### Auth (`lib/auth-token.ts`)

- Bearer token mirrored to **`schoolsetu_token`** cookie (`SameSite=Lax`, 7-day max-age).
- **`authHeaders()`** for **`Authorization`** on admin/school/dashboard calls.

---

## Key pages (behaviour-level)

### Home **`app/(public)/page.tsx`**

Server component concurrent **`fetchSchoolsList`** for featured + admission-open grids; **`SchoolCard`** + **`HeroSearch`**.

### Listings **`schools-listing-client.tsx`**

Client filters + sort (including **`newest`** via API); **`useQuery`** from TanStack Query.

### Detail **`(public)/schools/[slug]`**

Loads school by slug server-side where applicable; **`components/schools/school-detail-tabs.tsx`** organizes profile/facilities/inquiry/map tab content; **`SchoolInquiryCta`** + **`InquiryForm`** for **`parent`** JWT path.

### Inquiries (**`components/inquiry/inquiry-form.tsx`**)

- Zod schema: **`parentName`**, **`phone`**, **`childName`**, **`classApplying`**, **`message`**.
- POST **`/api/inquiries`** with **`authHeaders`**; handles **409** duplicate window (**7-day** wording from backend).

### AI **`components/ai/ai-chat.tsx`**

POST **`/api/ai/recommend`**, displays responses / errors.

### School dashboard **`school-dashboard-client.tsx`**

- Lists inquiries (**`GET /api/inquiries/for-school`**).
- Tabbed UX for **profile**, **gallery** (uses **`POST /api/upload/image`** with **`imageBase64`**, then PATCH-style submit via school update pending payload), **sections** submit.
- Submissions create **`PendingUpdate`** on backend (**no immediate live mutation**).

### Parent dashboard **`parent-dashboard-client.tsx`**

Shows parent inquiry history via **`/api/inquiries/my`**.

### Admin

- **`/admin`** — tiles + stats from **`/api/admin/schools`** and **`/api/inquiries`** patterns.
- **Schools**, **pending**, **moderation**, **inquiries**, **featured**, **users**, **audit-logs**, **blog** — wired to REST as implemented in respective page files (**see each file’s `fetch` paths**).
- **`/admin/cities`** — public **`GET /api/cities`** (read-only list).
- **`/admin/analytics`**, **`/admin/seo`**, **`/admin/payments`** — informational placeholders (env copy or “next release”) rather than full CRUD on **`SeoPage`**, analytics ingestion, or live Razorpay.

---

## Styling conventions

Design tokens live in **`app/globals.css`**: palette (`--ink`, **`#185FA5`**, amber neutrals), **`font-heading`** / **`font-body`**, **`.container-shell`**. Components compose Tailwind utilities; **`cn()`** merges variants.

Shared primitives:**`Button`** (variants: default / amber / outline / ghost), **`Badge`** tones, **`Card`**, **`Tabs`** wrappers.

---

## Environment

| Variable | Role |
| --- | --- |
| **`NEXT_PUBLIC_API_URL`** | Backend origin (`http://localhost:4000` in dev) |
| **`JWT_SECRET`** | Must match backend — **middleware** JWT verification |

Optional (only if you wire UI): **`NEXT_PUBLIC_GA_ID`**, **`NEXT_PUBLIC_POSTHOG_KEY`** — referenced only on admin Analytics placeholder today.

---

## Scripts

```bash
npm run dev      # next dev
npm run build    # production build (generates routes + sitemap)
npm run typecheck # tsc --noEmit
```

---

## Accuracy notes (avoid doc drift)

- Do **not** document **`lucide-react`**; icons come from **`react-icons`**.
- Blog content is **not** three hardcoded SSR articles anymore — **`fetchPublishedBlogPosts`** drives **`generateStaticParams`** for dynamic slugs.
- Admin is **multiple route files**, not only a single **`admin/[section]/page.tsx`** pattern.
- **Payments** UX should stay aligned with backend **503/disabled**.

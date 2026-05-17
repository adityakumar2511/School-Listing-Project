# SchoolSetu Frontend Documentation

**Last Updated:** May 17, 2026

Next.js App Router frontend for discovery, inquiries, dashboards, admin tools, blog, and sitemap generation. Backend base URL **`NEXT_PUBLIC_API_URL`** → `fetch` for schools, inquiries, moderation, audit logs, cities, blogs, and **auth** (`/api/auth/*`). Define client/server env values in **`frontend/.env`** (e.g. **`NEXT_PUBLIC_API_URL`**, **`JWT_SECRET`** for middleware — must match the backend **`JWT_SECRET`**).

---

## Purpose

| Audience | What ships today |
| --- | --- |
| **Parents** | Home (API-driven featured + admission lists), school listing/filter/sort (**`fetchSchoolsList`**), compare, **`/auth/login`** (parent column: email/password, mobile OTP, Google), **`/auth/register/parent`** (email OTP verification), **`/auth/forgot-password`**, **`/dashboard`** (**`GET /api/inquiries/my`**), **`InquiryForm`** → **`POST /api/inquiries`**, AI chat, static marketing pages, **blog list/detail from API**. |
| **Schools** | **`/auth/login`** (school column: same three auth modes), **`/auth/register/school`** (3-step owner + school info + review → email OTP), **`/school/dashboard`** — **`GET /api/schools/me`** drives **pending** (review banner), **rejected** (message), or **approved** full dashboard (**Profile**, **Gallery**, **Inquiries**, **Sections** tabs). |
| **Admins** | **`/admin`** and dedicated routes (schools, pending, moderation, inquiries, audit logs, cities, featured, blog, plus placeholder-style **SEO**, **Analytics**, **Payments** shells). Middleware enforces **admin** JWT for **`/admin/*`**. Default seeded login: **`adityak4724@gmail.com`** / **`Admin@123`** (see **`backend/prisma/seed.ts`**). |

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
| `react-hook-form` + `@hookform/resolvers` + `zod` | Forms (inquiries, dashboards, auth flows) |
| `react-icons` | Icons (**no `lucide-react` dependency**) |
| `@radix-ui/react-slot` | Button `asChild` |
| **`@radix-ui/react-tabs`** | Tab UIs (e.g. school detail, dashboard, login columns) |
| `framer-motion` | Lightweight motion |
| **`jose`** | Edge **`middleware.ts`** verifies JWT (**requires `JWT_SECRET` on the Next server**) |
| `next-auth` | Google session bridge; tokens from backend **`/api/auth/google`** integrate with the unified login UI |

---

## Route guard (`middleware.ts`)

**Matcher:** **`/admin/*`**, **`/school/dashboard/*`**, **`/dashboard/*`**.

- Reads the **`schoolsetu_token`** cookie (set by **`setAuthToken`** alongside **`localStorage`**).
- Verifies JWT with **`process.env.JWT_SECRET`** (must match backend **`JWT_SECRET`**).
- **`/admin/*`**: must be **`role === "admin"`**.
- **`/school/dashboard/*`**: **`role === "school"`** or **`"admin"`**.
- **`/dashboard/*`**: **`role === "parent"`**; **`admin`** is redirected to **`/admin`**, **`school`** to **`/school/dashboard`**.
- **No token** or invalid token: redirect to **`/auth/login?redirect=<original-path>`**.

Missing **`JWT_SECRET`** → middleware cannot admit users (token verification fails).

---

## Auth pages (rebuilt)

### **`/auth/login`** (single page, two columns)

- **Layout:** Two columns — **Parent / Student** (left) and **School** (right).
- **Tabs (each column):** **[Email & password]** · **[Mobile OTP]** · **[Google]**.
- **Email tab:** includes **Forgot password?** → **`/auth/forgot-password`**.
- After successful auth, navigation respects **`?redirect=`** when safe (same-origin path); otherwise **`navigateAfterAuth`** in **`lib/auth-routing.ts`** sends **admin → `/admin`**, **school → `/school/dashboard`**, **parent → `/dashboard`**.

### **`/auth/register/parent`**

- Fields: **name**, **email**, **password**, **phone (optional)**.
- Flow: submit → backend sends **email OTP** → in-app OTP verification step → JWT stored via **`setAuthToken`**.

### **`/auth/register/school`** (three steps)

1. **Owner account** (credentials / contact).
2. **School info** — name, type, board, address, description, established year, principal, etc.
3. **Review & submit** → email OTP verification → success screen. New schools are **`pending`** until admin approval.

### **`/auth/forgot-password`**

- **Email** → OTP (dev: backend console) → **new password** → can sign in with **`/auth/login`**.

### Removed / merged paths (do not link to these)

The following are **obsolete** (merged or replaced):

- **`/auth/parent/login`** — merged into **`/auth/login`**.
- **`/auth/school/login`** — merged into **`/auth/login`**.
- Standalone **`/auth/school/register`** — replaced by **`/auth/register/school`**.
- Prior standalone login page structure — replaced by the unified two-column **`/auth/login`**.

Standalone **`/auth/verify-otp`** as a dedicated public page may be removed; OTP verification is embedded in register/login flows where applicable.

---

## Site header (`components/site-header.tsx`)

- **Logged out:** a single **Login** button (entry to **`/auth/login`**).
- **Logged in:** user **name**, **role** badge, and **Logout**.
- **Logout:** **`clearAuthToken()`** then redirect to **`/`**.

---

## Directory highlights

```text
frontend/
├── Frontend.md
├── package.json
├── middleware.ts              # JWT + role gates; cookie schoolsetu_token
├── next.config.ts
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── sitemap.ts             # aggregates schools/cities/boards/blog from API
│   ├── admin/
│   │   ├── page.tsx           # hub + overview queries; pending schools + Review
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
│   ├── dashboard/             # parent dashboard client → GET /api/inquiries/my
│   ├── school/dashboard/      # owner dashboard client → GET /api/schools/me
│   ├── api/auth/[...nextauth]/
│   └── (public)/
│       ├── page.tsx           # homepage uses fetchSchoolsList
│       ├── ai-recommend/
│       ├── about/, contact/, for-schools/
│       ├── privacy-policy/, terms-of-service/
│       ├── compare/
│       ├── blog/, blog/[slug]/
│       ├── auth/
│       │   ├── login/         # unified two-column login
│       │   ├── register/
│       │   │   ├── parent/
│       │   │   └── school/
│       │   └── forgot-password/
│       └── schools/
│           ├── page.tsx
│           ├── schools-listing-client.tsx
│           ├── [slug]/
│           ├── board/[board]/
│           ├── category/[category]/
│           └── state/[state]/
├── components/
│   ├── ai/ai-chat.tsx
│   ├── inquiry/inquiry-form.tsx
│   ├── schools/
│   ├── ui/
│   ├── providers.tsx
│   ├── site-header.tsx, site-footer.tsx
├── lib/
│   ├── auth-token.ts         # localStorage + cookie; getUserFromToken; authHeaders
│   ├── auth-api.ts           # postAuthJson → /api/auth/*
│   ├── auth-routing.ts       # redirect sanitization; navigateAfterAuth
│   ├── schools-api.ts
│   ├── blog-api.ts
│   └── utils.ts
├── store/compare-store.ts
└── data/schools.ts
```

---

## Auth token helpers (`lib/auth-token.ts`)

| Function | Behaviour |
| --- | --- |
| **`setAuthToken(token)`** | Persists to **`localStorage`** (`AUTH_TOKEN_KEY` / `schoolsetu_token`) **and** sets cookie **`schoolsetu_token`** (**7 days**, **`SameSite=Lax`**, `path=/`). |
| **`getAuthToken()`** | Client-only: **`localStorage` first**, then **`document.cookie`** fallback. |
| **`clearAuthToken()`** | Removes **`localStorage`** entry and expires the cookie. |
| **`authHeaders()`** | Returns **`{ Authorization: `Bearer ${token}` }`** or `{}` if no token. |
| **`getUserFromToken()`** | Decodes JWT payload from the **middle segment** (base64url) → **`{ id, role, email, name, phone }`** (nullable fields where absent). |

Typed POST helpers for auth endpoints: **`lib/auth-api.ts`** (**`postAuthJson`**, **`getAuthApiOrigin`**, **`authErrorMessage`**).

---

## Data fetching

### Schools (`lib/schools-api.ts`)

- **`API_URL`** defaults to **`http://localhost:4000`**.
- **`fetchSchoolsList(params)`** — **`GET /api/schools`**, merges query string (includes **`limit`**, **`page`**, **`sort=newest`**, boards, admission, featured, …). **Only approved** schools appear.
- **`fetchSchoolBySlug(slug)`** — **`GET /api/schools/:slug`**.
- Responses normalized to **`NormalizedSchool`** / **`NormalizedSchoolDetail`** shapes for listing + detail consumers.

Used by homepage, listings, routed pages (`board`, `state`, `category`, detail), **`sitemap.ts`**.

### Blog (`lib/blog-api.ts`)

- **`GET /api/admin/blog`** and **`GET /api/admin/blog/:slug`** match backend public mounts.
- **`revalidate = 3600`** on **`app/(public)/blog/*`** aligns with ISR-style refresh.

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

### School dashboard **`school-dashboard-client.tsx`** (and related)

- Fetches **`GET /api/schools/me`**.
- **Pending:** “Under admin review” style banner; **Rejected:** rejection messaging; **Approved:** full dashboard.
- **Approved:** tabs for **Profile**, **Gallery**, **Inquiries**, **Sections**; submissions for profile/gallery/sections use **`PUT /api/schools/:id`** → **`PendingUpdate`** (no immediate live merge until moderation approves).
- Inquiry list for the school via **`GET /api/inquiries/for-school`** where wired.

### Parent dashboard **`parent-dashboard-client.tsx`**

- **`GET /api/inquiries/my`** — history with school name, status, date.

### Admin

- **`/admin`** — overview including **pending schools** count with **Review** affordance; stats from admin/school APIs as implemented.
- **Schools**, **pending**, **moderation**, inquiries, **featured**, **users**, **audit-logs**, **blog** — wired to REST in respective page files.
- **`/admin/cities`** — public **`GET /api/cities`** (read-only list).
- **`/admin/analytics`**, **`/admin/seo`**, **`/admin/payments`** — informational placeholders.

---

## Styling conventions

Design tokens live in **`app/globals.css`**: palette (`--ink`, **`#185FA5`**, amber neutrals), **`font-heading`** / **`font-body`**, **`.container-shell`**. Components compose Tailwind utilities; **`cn()`** merges variants.

Shared primitives: **`Button`** (variants: default / amber / outline / ghost), **`Badge`** tones, **`Card`**, **`Tabs`** wrappers.

---

## Environment

| Variable | Role |
| --- | --- |
| **`NEXT_PUBLIC_API_URL`** | Backend origin (`http://localhost:4000` in dev) |
| **`JWT_SECRET`** | Must match backend — **middleware** JWT verification for **`schoolsetu_token`** |

Optional (only if you wire UI): **`NEXT_PUBLIC_GA_ID`**, **`NEXT_PUBLIC_POSTHOG_KEY`** — referenced only on admin Analytics placeholder today.

---

## Dev behaviour (auth)

- **Mobile OTP** and **email OTP** codes are printed in the **backend** terminal in development (see Backend.md / backend controllers).
- **Twilio** only runs when backend **`TWILIO_ACCOUNT_SID`** is configured.
- **SMTP** only used when **`SMTP_HOST`** is set; otherwise email falls back per backend implementation (often console in dev).

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
- Auth entry is **`/auth/login`** (not separate parent/school login URLs).

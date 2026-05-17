# SchoolSetu

SchoolSetu is a full-stack school discovery and admission platform focused on Tier-2 and Tier-3 Indian cities. Parents can search and compare schools, read blog content, use an AI recommendation helper, and submit OTP-verified admission inquiries. Schools can register, sign in, manage inquiries, and submit profile, gallery, and section updates for admin review. Admins moderate schools, pending profile changes, and audit activity.

**Docs:** `frontend/Frontend.md` (UI, routes, data layer) · `backend/Backend.md` (API, Prisma, services)

## Target cities (seed / product focus)

| City | Notes |
| --- | --- |
| Prayagraj | Primary seeded city and listing coverage. |
| Banda, Kanpur, Jhansi, Lucknow | Seeded for expansion; listing depth varies. |

## Audiences

| Audience | In the product today |
| --- | --- |
| Parents | Public discovery, compare, blog, AI recommend page, OTP auth, inquiry submission. |
| Schools | Registration, OTP/school login, dashboard: inquiries, profile/gallery/sections submit → `PendingUpdate`. |
| Admins | Admin UI areas (schools, moderation, audit logs, etc.) backed by JWT + Prisma APIs. |

## Tech stack (summary)

| Area | Stack |
| --- | --- |
| Frontend | Next.js App Router, React 19, TypeScript, Tailwind 4, TanStack Query, Zustand, React Hook Form + Zod, Radix UI (tabs, slot), Framer Motion |
| Backend | Node.js, Express 5, TypeScript, Prisma, PostgreSQL, JWT auth, Zod, Helmet, rate limiting, Winston logger |
| Integrations (optional in dev) | Twilio (SMS/WhatsApp), Cloudinary (images), OpenAI (AI recommend), Resend (email), Razorpay (payments — limited/disabled in current health check) |

## Monorepo layout

```text
.
├── README.md
├── package.json              # workspace root; npm run dev runs frontend + backend
├── backend/
│   ├── Backend.md
│   ├── src/
│   │   ├── app.ts, server.ts
│   │   ├── config/           # env, prisma, logger
│   │   ├── controllers/      # auth, schools, inquiries, admin, ai, media, payments, taxonomy, blog
│   │   ├── data/mock-schools.ts   # Prisma listing helpers (name kept for history)
│   │   ├── middleware/     # auth, security, error-handler; audit.middleware.ts exists but is not mounted globally
│   │   ├── prisma/
│   │   ├── routes/
│   │   └── services/       # ai, audit, cloudinary, razorpay, resend, twilio, etc.
│   └── package.json
└── frontend/
    ├── Frontend.md
    ├── app/                  # App Router: (public), admin, school/dashboard, auth, sitemap.ts
    ├── components/
    ├── lib/                  # schools-api, blog-api, auth-token, utils
    ├── data/schools.ts       # fallbacks / static helpers where used
    └── package.json
```

## Quick start

### 1. Install

```bash
git clone <repo-url>
cd "6. School Listing Project"
npm install
```

### 2. Environment

**`backend/.env`** (typical):

```bash
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/schoolsetu
JWT_SECRET=use-a-long-random-secret
```

**`frontend/.env`:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Optional: `OPENAI_API_KEY`, Twilio, Cloudinary, Resend, Razorpay keys — features degrade or skip when missing.

### 3. Database

```bash
cd backend
npx prisma migrate dev
npx prisma generate
npm run seed
```

### 4. Dev servers

From repo root:

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

### 5. Quality gates

```bash
npm run typecheck
npm run build
```

## Environment variables (high level)

| Scope | Variable | Purpose |
| --- | --- | --- |
| Frontend | `NEXT_PUBLIC_API_URL` | Backend origin for `fetch` (schools, blog, etc.). |
| Backend | `DATABASE_URL` | PostgreSQL for Prisma. |
| Backend | `JWT_SECRET` | Signs bearer JWTs (default in dev is weak — change in production). |
| Backend | `FRONTEND_URL` | CORS origin. |
| Backend | Provider keys | Twilio, Cloudinary, OpenAI, Resend, Razorpay — optional locally; see `backend/src/config/env.ts`. |

## Scripts (root `package.json`)

| Script | Role |
| --- | --- |
| `npm run dev` | Frontend + backend in parallel. |
| `npm run typecheck` | Typecheck both workspaces. |
| `npm run build` | Production builds. |

## Implemented features (current)

- **Public site:** Home (featured + admission-open lists from API), school listing with filters, school detail (tabbed layout, map when coords exist, nearby via API), city/board/category/state routes, compare, AI recommend page, static marketing pages, **blog from API** (`GET /api/admin/blog` public), **`app/sitemap.ts`** aggregating schools, cities, boards, blog posts, and static URLs.
- **Auth:** Phone OTP via backend; JWT in `localStorage` + cookie; role selector and parent/school login flows; `next-auth` present but not the primary OTP path.
- **Inquiries:** Parent-authenticated `POST /api/inquiries`; duplicate window; school/admin status and notes; school dashboard table.
- **School accounts:** `POST /api/schools` registers school + related rows in a transaction; `GET /api/schools/me` for owner; `PUT /api/schools/:id` creates **`PendingUpdate`** (profile, fees, address, gallery list, sections list as submitted); school dashboard **Profile / Gallery / Sections** tabs.
- **Media:** `POST /api/upload/image` with JSON **`{ imageBase64 }`** (data URL or base64); `DELETE /api/upload/image/:id` removes a **`SchoolGallery`** row and Cloudinary asset when configured.
- **Admin API:** Schools approve/reject/edit/delete, featured toggle, moderation queue + approve/reject pending updates (applies merged profile/gallery/sections when approved), audit log list + stats, **blog CRUD** (`POST`/`PUT`/`DELETE` under `/api/admin/blog` with admin auth).
- **Audit logging:** `createAuditLog` used from auth (admin login) and admin school actions; **`AuditAction`** enum is limited to school + admin login actions (see `backend/Backend.md`). `audit.middleware.ts` is **not** wired into `app.ts` today.

## Known gaps / partial areas

- **Payments:** Health endpoint reports payments disabled; webhook/signature flows are not production-complete.
- **Google OAuth:** Placeholder / not the primary login path; OTP is.
- **Admin UI** pages vary in how fully they call every backend capability — treat `frontend/app/admin/*` as screens that should match the API over time.

## API overview

Base URL: `/api` on the backend server. Common routes:

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | Status + feature flags. |
| POST | `/auth/send-otp`, `/auth/verify-otp` | No | OTP login; admin OTP logs `ADMIN_LOGIN` when applicable. |
| GET | `/schools` | No | Approved schools; filters incl. `limit` up to **1000**. |
| GET | `/schools/me` | Yes (`school`) | Owner’s school + relations. |
| GET | `/schools/:slug` | No | Approved school detail. |
| POST | `/schools` | Yes | New school registration. |
| PUT | `/schools/:id` | Yes (`school`/`admin`) | Submit **`PendingUpdate`** (even for admin JWT — no shortcut on this path). |
| PUT | `/admin/schools/:id/edit` | Yes (`admin`) | Direct top-level **`School`** row patch (outside the moderation queue). |
| POST | `/inquiries` | Yes (`parent`) | Create inquiry. |
| GET | `/inquiries/for-school` | Yes (`school`/`admin`) | School’s inquiries. |
| PUT | `/inquiries/:id/status` | Yes (`school`/`admin`) | Update status. |
| POST | `/inquiries/:id/notes` | Yes (`school`/`admin`) | Add note. |
| POST | `/ai/recommend` | No | AI helper (mock if no OpenAI key). |
| GET | `/admin/blog` | No | Published posts (mounted in `routes/index.ts`). |
| GET | `/admin/blog/:slug` | No | Single published post. |
| POST/PUT/DELETE | `/admin/blog`, `/admin/blog/:id` | Yes (`admin`) | Blog management. |
| GET | `/admin/schools`, moderation, audit-logs, … | Yes (`admin`) | Operations (see Backend.md). |
| POST | `/upload/image` | Yes (`school`/`admin`) | Base64/image upload to Cloudinary. |
| DELETE | `/upload/image/:id` | Yes (`school`/`admin`) | Gallery row + Cloudinary cleanup. |
| GET | `/cities`, `/states`, `/boards` | No | Taxonomy. |

Full detail: **`backend/Backend.md`**.

## Database (conceptual)

Prisma models include `User`, `OtpCode`, geography (`State`, `City`, `Board`), `School` and nested `SchoolDetails`, `SchoolAddress`, `SchoolAcademics`, `SchoolFees`, `SchoolFacilities`, `SchoolGallery`, `SchoolSection`, `SchoolAchievement`, `Inquiry`, `InquiryNote`, `PendingUpdate`, `ApprovalLog`, `FeaturedListing`, `Payment`, `BlogPost`, `SeoPage`, `Facility`, **`AuditLog`**. Enum values must match **`schema.prisma`** — see Backend.md for the current **`AuditAction`** set.

## Contributing

- TypeScript-first; validate HTTP input with Zod on the backend.
- Use design tokens documented in **`frontend/Frontend.md`**.
- Run `npm run typecheck` (and `npm run build` when appropriate) before handing off.

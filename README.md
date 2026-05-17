# SchoolSetu

**Last Updated:** May 17, 2026

SchoolSetu is a full-stack school discovery and admission platform focused on Tier-2 and Tier-3 Indian cities. Parents can search and compare schools, read blog content, use an AI recommendation helper, and submit admission inquiries. Schools complete a multi-step registration with email verification, then work through an admin approval workflow before appearing on the public listing. Admins moderate schools, pending profile changes, and audit activity.

**Docs:** `frontend/Frontend.md` (UI, routes, data layer) · `backend/Backend.md` (API, Prisma, services)

## Target cities (seed / product focus)

| City | Notes |
| --- | --- |
| Prayagraj | Primary seeded city and listing coverage. |
| Banda, Kanpur, Jhansi, Lucknow | Seeded for expansion; listing depth varies. |

## Audiences

| Audience | In the product today |
| --- | --- |
| Parents | Public discovery, compare, blog, AI recommend page, **email/password, mobile OTP, or Google** sign-in (JWT), inquiry submission, **`/dashboard`** with inquiry history. |
| Schools | **`/auth/register/school`** (3-step flow + email OTP), **`/auth/login`** (school column), **`/school/dashboard`** with **pending / approved / rejected** status UX; profile, gallery, sections, and inquiries once approved. |
| Admins | Admin UI (`/admin`) backed by JWT + Prisma APIs; seeded admin **`adityak4724@gmail.com`** / **`Admin@123`** (stored as bcrypt hash via `npm run seed` — see `ADMIN_DEFAULT_PASSWORD` in `backend/prisma/seed.ts`). |

## Tech stack (summary)

| Area | Stack |
| --- | --- |
| Frontend | Next.js App Router, React 19, TypeScript, Tailwind 4, TanStack Query, Zustand, React Hook Form + Zod, Radix UI (tabs, slot), Framer Motion, **`jose`** (middleware JWT), NextAuth (Google bridge) |
| Backend | Node.js, Express 5, TypeScript, Prisma, PostgreSQL, JWT auth, **bcrypt** (passwords), Zod, Helmet, rate limiting, Winston logger, **nodemailer** (optional SMTP), Twilio (optional SMS) |
| Integrations (optional in dev) | **SMTP** (`SMTP_HOST`, …) or console logging for email OTP; **Twilio** only when `TWILIO_ACCOUNT_SID` is set; Cloudinary (images), OpenAI (AI recommend), Resend (email fallback where wired), Razorpay (payments — limited/disabled in current health check) |

## Monorepo layout

```text
.
├── README.md
├── package.json              # workspace root; npm run dev runs frontend + backend
├── backend/
│   ├── Backend.md
│   ├── prisma/               # schema.prisma, migrations, seed.ts
│   ├── src/
│   │   ├── app.ts, server.ts
│   │   ├── config/           # env, prisma client singleton, logger
│   │   ├── controllers/      # auth, schools, inquiries, admin, ai, media, payments, taxonomy, blog
│   │   ├── data/mock-schools.ts   # Prisma listing helpers (name kept for history)
│   │   ├── generated/prisma/ # Prisma client output (generator output path)
│   │   ├── middleware/       # auth, security, error-handler; audit.middleware.ts exists but is not mounted globally
│   │   ├── routes/
│   │   └── services/         # ai, audit, cloudinary, otp, smtp, razorpay, resend, twilio, etc.
│   └── package.json
└── frontend/
    ├── Frontend.md
    ├── app/                  # App Router: (public), admin, school/dashboard, auth, sitemap.ts
    ├── components/
    ├── lib/                  # schools-api, blog-api, auth-token, auth-api, auth-routing, utils
    ├── data/schools.ts       # fallbacks / static helpers where used
    └── package.json
```

## Authentication (rebuilt)

All auth HTTP endpoints are under **`/api/auth/`** on the backend. The JWT is an HS256 bearer token (**7-day expiry**) with payload:

**`{ id, role, email, phone, name }`**

- **Passwords:** hashed with **bcrypt** (`passwordHash` on `User`).
- **Email verification:** parent and school registration send an **email OTP**; **`isEmailVerified`** must be true before **email + password** login succeeds.
- **Phone OTP login:** `POST /api/auth/send-otp` then `POST /api/auth/verify-otp` (upserts user, returns JWT).
- **Google:** `POST /api/auth/google` with `googleId`, `email`, `name` — upsert and JWT.
- **Forgot password:** `POST /api/auth/forgot-password` (email → reset OTP), then `POST /api/auth/reset-password` (email + OTP + new password).

Frontend stores the token via **`frontend/lib/auth-token.ts`**: **localStorage** key and **`schoolsetu_token`** cookie (7 days, **SameSite=Lax**). **`middleware.ts`** reads the **cookie** and enforces role-based access (see Frontend.md).

### Dev behaviour

- **Mobile OTP:** logged to the backend terminal as `[DEV OTP] Phone: … OTP: …`
- **Email OTP:** logged as `[DEV EMAIL OTP] To: …@… OTP: …`
- **Twilio:** used only when **`TWILIO_ACCOUNT_SID`** (and related vars) are present.
- **SMTP email:** used when **`SMTP_HOST`** is present; otherwise development falls back to console (and other providers may apply where implemented — see `backend/src/config/env.ts` and services).

## School registration and visibility

1. School owner submits **`POST /api/auth/register/school`** (multi-field payload).
2. **Email OTP** verification is required (**`POST /api/auth/verify-email-otp`**).
3. After verification, the school’s status is **`pending`**.
4. The **school dashboard** shows an **“Under admin review”** banner while **pending**.
5. An **admin** approves or rejects from **`/admin`**; **approved** schools appear on the **public listing** (`GET /api/schools` is approved-only).
6. **Rejected** schools see a rejection message in the dashboard.

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
# Optional — email OTP via SMTP (omit in dev to log OTPs to terminal)
# SMTP_HOST=...
# SMTP_PORT=587
# SMTP_USER=...
# SMTP_PASS=...
# Optional — real SMS (omit in dev; OTP prints to terminal)
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=...
```

**`frontend/.env`:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
JWT_SECRET=same-as-backend-JWT_SECRET
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
| Frontend | `NEXT_PUBLIC_API_URL` | Backend origin for `fetch` (schools, blog, auth API helpers, etc.). |
| Frontend | `JWT_SECRET` | Must match backend — **middleware** verifies JWT from the **`schoolsetu_token`** cookie. |
| Backend | `DATABASE_URL` | PostgreSQL for Prisma. |
| Backend | `JWT_SECRET` | Signs bearer JWTs (default in dev is weak — change in production). |
| Backend | `FRONTEND_URL` | CORS origin. |
| Backend | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Optional SMTP for transactional email; without `SMTP_HOST`, dev typically logs OTPs. |
| Backend | `TWILIO_*` | Optional; real SMS only when `TWILIO_ACCOUNT_SID` (etc.) is set. |
| Backend | Other provider keys | Cloudinary, OpenAI, Resend, Razorpay — optional locally; see `backend/src/config/env.ts`. |

## Scripts (root `package.json`)

| Script | Role |
| --- | --- |
| `npm run dev` | Frontend + backend in parallel. |
| `npm run typecheck` | Typecheck both workspaces. |
| `npm run build` | Production builds. |

## Implemented features (current)

- **Public site:** Home (featured + admission-open lists from API), school listing with filters, school detail (tabbed layout, map when coords exist, nearby via API), city/board/category/state routes, compare, AI recommend page, static marketing pages, **blog from API** (`GET /api/admin/blog` public), **`app/sitemap.ts`** aggregating schools, cities, boards, blog posts, and static URLs.
- **Auth:** Rebuilt **REST JWT** flow — parent/school **register**, **email OTP verify**, **login** (email/password with verification check), **phone OTP**, **Google** upsert, **forgot/reset password**; token in **localStorage + cookie**; unified **`/auth/login`** (two-column parent | school UI with tabs). NextAuth supports the Google bridge; the primary contract is backend **`/api/auth/*`**.
- **Inquiries:** Parent-authenticated `POST /api/inquiries`; duplicate window; school/admin status and notes; dashboards surface lists (`GET /api/inquiries/my`, `GET /api/inquiries/for-school`).
- **School accounts:** Registration via **`/api/auth/register/school`** + verification; **`GET /api/schools/me`** for owner dashboard; **`POST /api/schools`** remains available for authenticated creation flows; **`PUT /api/schools/:id`** creates **`PendingUpdate`** (profile, fees, address, gallery list, sections list as submitted); approved school dashboard **Profile / Gallery / Sections / Inquiries** tabs.
- **Media:** `POST /api/upload/image` with JSON **`{ imageBase64 }`** (data URL or base64); `DELETE /api/upload/image/:id` removes a **`SchoolGallery`** row and Cloudinary asset when configured.
- **Admin API:** Schools approve/reject/edit/delete, featured toggle, moderation queue + approve/reject pending updates (applies merged profile/gallery/sections when approved), audit log list + stats, **blog CRUD** (`POST`/`PUT`/`DELETE` under `/api/admin/blog` with admin auth).
- **Audit logging:** `createAuditLog` used from auth (admin flows) and admin school actions; **`AuditAction`** enum is limited to school + admin login actions (see `backend/Backend.md`). `audit.middleware.ts` is **not** wired into `app.ts` today.

## Known gaps / partial areas

- **Payments:** Health endpoint reports payments disabled; webhook/signature flows are not production-complete.
- **Admin UI** pages vary in how fully they call every backend capability — treat `frontend/app/admin/*` as screens that should match the API over time.

## API overview

Base URL: `/api` on the backend server. Auth routes (non-exhaustive — see **Backend.md**):

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register/parent` | No | Parent register; sends **email OTP**. |
| POST | `/auth/register/school` | No | School register; sends **email OTP**. |
| POST | `/auth/verify-email-otp` | No | Verify email OTP → **`isEmailVerified`**, returns **JWT**. |
| POST | `/auth/login` | No | Email + password → **JWT** (requires verified email). |
| POST | `/auth/send-otp` | No | Phone OTP (dev: terminal log; Twilio if configured). |
| POST | `/auth/verify-otp` | No | Phone + OTP → upsert user → **JWT**. |
| POST | `/auth/forgot-password` | No | Email → **password-reset** OTP (dev: console). |
| POST | `/auth/reset-password` | No | Email + OTP + new password. |
| POST | `/auth/google` | No | `googleId` + email + name → upsert → **JWT**. |

Other common routes:

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | Status + feature flags. |
| GET | `/schools` | No | **Approved** schools only; filters incl. `limit` up to **1000**. |
| GET | `/schools/me` | Yes | Owner’s school + relations. |
| GET | `/schools/:slug` | No | Approved school detail. |
| POST | `/schools` | Yes | Creates school (+ nested rows) in a transaction (role/profile flows as implemented). |
| PUT | `/schools/:id` | Yes (`school`/`admin`) | Submit **`PendingUpdate`**. |
| PUT | `/admin/schools/:id/edit` | Yes (`admin`) | Direct top-level **`School`** row patch. |
| POST | `/inquiries` | Yes (`parent`) | Create inquiry. |
| GET | `/inquiries/my` | Yes (`parent`) | Caller’s inquiries. |
| GET | `/inquiries/for-school` | Yes (`school`/`admin`) | School’s inquiries. |
| PUT | `/inquiries/:id/status` | Yes (`school`/`admin`) | Update status. |
| POST | `/inquiries/:id/notes` | Yes (`school`/`admin`) | Add note. |
| POST | `/ai/recommend` | No | AI helper (mock if no OpenAI key). |
| GET | `/admin/blog` | No | Published posts. |
| GET | `/admin/blog/:slug` | No | Single published post. |
| POST/PUT/DELETE | `/admin/blog`, `/admin/blog/:id` | Yes (`admin`) | Blog management. |
| GET | `/admin/schools`, moderation, audit-logs, … | Yes (`admin`) | Operations (see Backend.md). |
| POST | `/upload/image` | Yes (`school`/`admin`) | Base64/image upload to Cloudinary. |
| DELETE | `/upload/image/:id` | Yes (`school`/`admin`) | Gallery row + Cloudinary cleanup. |
| GET | `/cities`, `/states`, `/boards` | No | Taxonomy. |

Full detail: **`backend/Backend.md`**.

## Database (conceptual)

Prisma schema: **`backend/prisma/schema.prisma`**. Models include **`User`** (email/phone uniqueness, **`passwordHash`**, **`googleId`**, **`isEmailVerified`**, **`isPhoneVerified`**, **`UserRole`**), **`OtpCode`** (**`identifier`**, **`OtpType`**: `EMAIL_VERIFY` | `PHONE_LOGIN` | `PASSWORD_RESET`, **`expiresAt`**, **`used`**), geography (`State`, `City`, `Board`), `School` and nested details, `Inquiry`, `PendingUpdate`, `BlogPost`, **`AuditLog`**, etc. Enum values must match **`schema.prisma`** — see Backend.md for **`AuditAction`** and school status (**`pending` | `approved` | `rejected`**).

## Contributing

- TypeScript-first; validate HTTP input with Zod on the backend.
- Use design tokens documented in **`frontend/Frontend.md`**.
- Run `npm run typecheck` (and `npm run build` when appropriate) before handing off.

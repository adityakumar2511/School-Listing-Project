# SchoolSetu Backend Documentation

Express + Prisma API for SchoolSetu: auth, taxonomy, schools, inquiries, uploads, moderation, admin tools, audit logging, AI recommendations, and (disabled) Razorpay hooks.

---

## Purpose

- Serve JSON under `/api` for the Next.js app.
- Persist schools, taxonomy, inquiries, pending profile updates, blog posts, and audit logs in PostgreSQL.
- Optional integrations when env vars exist: Twilio (OTP/notifications), Cloudinary (images), OpenAI (`/ai`), Resend (email).

---

## Tech stack

| Package | Role |
| --- | --- |
| `express` | HTTP app and routers |
| `typescript` | Types across controllers and services |
| `tsx` | Dev server / scripts |
| `prisma`, `@prisma/client` | Schema, migrations, DB access |
| `zod` | Request validation |
| `jsonwebtoken` | JWT for `Bearer` auth |
| `helmet`, `cors`, `express-rate-limit` | Security and throttling (`otpRateLimit` on OTP endpoints) |
| `morgan` | Request logging |
| `winston` | Structured logging (`src/config/logger.ts`) |

`pino` is listed in `package.json` but the app imports **Winston** from `logger.ts`.

---

## Directory layout

```text
backend/
├── Backend.md
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── src/
    ├── app.ts                 # helmet, cors, rate limit, json 12mb, morgan, /api router, error handler
    ├── server.ts
    ├── config/
    │   ├── env.ts             # Zod-validated process.env + defaults
    │   ├── prisma.ts          # PrismaClient singleton
    │   └── logger.ts          # Winston logger
    ├── controllers/
    │   ├── admin.controller.ts
    │   ├── ai.controller.ts
    │   ├── auth.controller.ts
    │   ├── blog.controller.ts
    │   ├── inquiries.controller.ts
    │   ├── media.controller.ts
    │   ├── payments.controller.ts
    │   ├── schools.controller.ts
    │   └── taxonomy.controller.ts
    ├── data/mock-schools.ts   # Helpers for listing/query shapes (historical filename)
    ├── middleware/
    │   ├── auth.ts            # requireAuth, requireRole
    │   ├── audit.middleware.ts # Present but not registered in app.ts
    │   ├── error-handler.ts
    │   └── security.ts        # cors, helmet, apiRateLimit, otpRateLimit
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    ├── routes/
    │   ├── index.ts           # Mounts routers; public blog GETs registered here before /admin
    │   ├── admin.routes.ts
    │   ├── ai.routes.ts
    │   ├── auth.routes.ts
    │   ├── inquiries.routes.ts
    │   ├── media.routes.ts
    │   ├── payments.routes.ts
    │   ├── schools.routes.ts
    │   ├── search.routes.ts    # Same list handler as GET /schools
    │   └── taxonomy.routes.ts
    ├── services/
    │   ├── ai.service.ts
    │   ├── audit.service.ts    # createAuditLog, extractActor
    │   ├── cloudinary.service.ts
    │   ├── otpService.ts       # Twilio OTP; dev OTP path when Twilio absent
    │   ├── razorpay.service.ts
    │   ├── resend.service.ts
    │   └── twilioService.ts
    └── utils/
        ├── async-handler.ts
        └── http-error.ts
```

---

## Environment

Load variables from **`backend/.env`** (standard local setup). `env.ts` validates required and optional vars. Minimum for core behavior:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signs JWTs (parent/school/admin) |
| `FRONTEND_URL` | Allowed CORS origin |
| `PORT` | API port (default in dev) |

Optional: `CLOUDINARY_*`, Twilio vars, `OPENAI_API_KEY`, Resend keys, Razorpay keys (`SCHOOL_REGISTRATION_EMAIL`, `ADMIN_NOTIFICATION_PHONE`, etc.). Missing providers cause graceful skips (e.g. upload returns 503 without Cloudinary; AI falls back where implemented).

---

## Authentication

- **`POST /api/auth/send-otp`** — Validates `+91` mobile; OTP via Twilio when configured; stricter **`otpRateLimit`**; may return **`devOtp`** in development when OTP is mocked.
- **`POST /api/auth/verify-otp`** — Verifies OTP (via `otpService`), upserts **`User`** by phone, optional `role` for new users (`school` vs default **parent**), returns **JWT** `{ id, role, phone }` embedded in HS256 token (7-day expiry).
- **`POST /api/auth/google`** — Upsert by `googleId` / email from **NextAuth** bridge; JWT same shape (`phone` may be absent).

Protected routes use header **`Authorization: Bearer <jwt>`**.

`middleware/auth.ts`:

- **`requireAuth`** — Attaches `request.user`.
- **`requireRole(...roles)`** — Ensures `user.role` is one of the listed roles (`parent` | `school` | `admin`).

OTP storage uses Prisma model **`OtpCode`** (not legacy names).

---

## Route map (`/api` prefix)

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/health` | No | `{ status, service, env, twilio.configured, payments.enabled: false }` |
| POST | `/auth/send-otp` | No | Send OTP |
| POST | `/auth/verify-otp` | No | Verify + JWT; admin OTP triggers **`ADMIN_LOGIN`** audit |
| POST | `/auth/google` | No | Google-linked JWT |
| GET | `/admin/blog` | No | Published blog posts (`BlogPost.publishedAt` set) |
| GET | `/admin/blog/:slug` | No | Single published post |
| GET | `/schools` | No | Approved schools list; **`limit` max 1000**, pagination, filters (see controller) |
| GET | `/schools/me` | Yes | Owner’s school with relations |
| GET | `/schools/:slug` | No | Approved school detail by slug |
| POST | `/schools` | Yes | **Transaction**: creates **`School`** (status **pending**) + nested rows; bumps user role toward **school**; notifications best-effort |
| PUT | `/schools/:id` | Yes, **school** or **admin** | Loads current profile snapshot; **`PendingUpdate`** row `fieldType: "profile"` with `oldValue` / `newValue` JSON (includes gallery + sections summaries). **Always** queues moderation — same path for admins (no shortcut here). |
| GET | `/inquiries` | **admin** | Platform-wide inquiries |
| GET | `/inquiries/for-school` | **school**, **admin** | Inquiries for the caller’s owned school |
| GET | `/inquiries/my` | **parent** | Caller’s inquiries |
| POST | `/inquiries` | **parent** | Create; **409** if duplicate within last **7 days** for same parent+school (`classApplying` from body) |
| PUT | `/inquiries/:id/status` | **school**, **admin** | Inquiry status (**new** \| **contacted** \| **interested** \| **converted** \| **closed**) |
| POST | `/inquiries/:id/notes` | **school**, **admin** | Add **`InquiryNote`** |
| POST | `/ai/recommend` | No | Recommendation payload (uses OpenAI when configured) |
| POST | `/upload/image` | **school**, **admin** | Body **`{ imageBase64 }`** (data URI or raw base64). Cloudinary upload; **503** if not configured |
| DELETE | `/upload/image/:id` | **school**, **admin** | **`school_gallery` id** — deletes Cloudinary asset (when inferable) and DB row |
| POST | `/payments/create-order` | — | **`503` “Payments coming soon”** wrapper (handlers not reached live) |
| POST | `/payments/verify-payment` | — | Same |
| POST | `/payments/webhook` | — | Same |
| GET | `/search` | No | Delegates to same **`listSchools`** as **`GET /schools`** |
| GET | `/cities`, `/states`, `/boards` | No | Taxonomy lists |

---

## Admin routes (`/api/admin`)

All mounted routes require **`requireAuth` + requireRole("admin")`** unless noted below (public blog is sibling in `index.ts`, not under this router).

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/users` | User list |
| GET | `/schools` | All schools |
| POST | `/schools` | Admin-created school |
| PUT | `/schools/:id/approve`, `/reject` | Approve pending school / reject (`SCHOOL_VERIFIED` / `SCHOOL_REJECTED` audits) |
| PUT | `/schools/:id/edit` | **Direct** **`prisma.school.update`** with request body (`SCHOOL_EDITED`). Does **not** go through **`PendingUpdate`** queue (shallow **`School`**-model fields only; nested relations belong in moderation payloads or migrations). |
| DELETE | `/schools/:id` | Delete |
| PUT | `/schools/:id/toggle-featured` | Featured flag |
| GET | `/moderation` | Pending **`PendingUpdate`** queue |
| PUT | `/moderation/:id/approve` | Approve and **merge** payload into **`School`** and related rows (gallery/sections/details/fees/address as implemented) |
| PUT | `/moderation/:id/reject` | Reject pending item |
| GET | `/audit-logs/stats`, `/audit-logs` | Audit listing + aggregates |
| POST | `/blog` | Create **`BlogPost`** |
| PUT | `/blog/:id` | Update |
| DELETE | `/blog/:id` | Delete |

---

## Blog (`blog.controller.ts`)

- **Public reads** attach to **`apiRouter`** in **`routes/index.ts`** **`before`** `apiRouter.use("/admin", …)` so paths are **`/api/admin/blog`** without admin JWT.
- **Writes** stay on **`adminRouter`** (`/api/admin/blog`).

---

## Schools controller (high level)

- **`listSchools`** — Approved-only public listing; query params validated with **`limit`** 1–**1000**; **`sort`** includes **`newest`** where wired in controller.
- **`getSchool`** — By slug for approved schools.
- **`getMySchool`** — Owner (**`school`**) resolves via **`School.ownerId`**.
- **`createSchool`** — See transaction above; rejects second school per owner (**409**).
- **`updateSchool`** — Builds **`oldValue`** from DB; **`PendingUpdate`** with **`newValue`** body; responds with **`pendingUpdate`**. (**Admins who need immediate top-level **`School`** field mutations use **`PUT /api/admin/schools/:id/edit`** instead.**)

Gallery entries for the dashboard combine **upload** (returns **`secure_url`**) then **school update** payloads that submit new **`gallery`** arrays in **`newValue`**; approve flow reconciles deletes vs Cloudinary URLs per **`admin.controller.ts`**.

---

## Media controller

- **`POST /api/upload/image`** — Validates **`imageBase64`** via Zod; accepts **`data:image/…;base64,…`** or raw base64.
- **`DELETE /api/upload/image/:id`** — **`SchoolGallery`** id; **`assertSchoolAccess`** enforces ownership (or admin behaviour as implemented in **`schools.controller`**).

---

## Payments

All **`paymentsRouter`** entry points wrap handlers with **`paymentsDisabled`** returning **`503`** with **`disabled: true`**. **`/health`** reports **`payments.enabled: false`**. Do not document live checkout until that wrapper is removed.

---

## AI

**`POST /api/ai/recommend`** uses **`ai.service.ts`** — uses OpenAI when **`OPENAI_API_KEY`** exists; otherwise the controller/service path supports a degraded/mock response pattern (check **`ai.controller.ts`** for exact message).

---

## Audit logging

- **`audit.service.ts`** exposes **`createAuditLog`** writing **`AuditLog`** rows.
- **Enum `AuditAction` (exactly these values):**

  **`SCHOOL_VERIFIED`**, **`SCHOOL_REJECTED`**, **`SCHOOL_EDITED`**, **`SCHOOL_DELETED`**, **`SCHOOL_FEATURED_TOGGLED`**, **`SCHOOL_CREATED`**, **`ADMIN_LOGIN`**.

There are **no** separate inquiry/user/team enum members in the schema; do not invent them in docs.

- **`auth.controller`** logs **`ADMIN_LOGIN`** after OTP verify for admins.
- **`admin.controller`** logs school lifecycle actions aligned with **`AuditAction`** where applied.

**`middleware/audit.middleware.ts`** exists **but is not** `app.use`’d globally — auditing is explicit from controllers/services, not middleware today.

---

## Prisma entities (conceptual)

- **Auth / users:** `User`, **`OtpCode`**
- **Geo / taxonomy:** `State`, `City`, `Board`, `Facility`
- **School aggregate:** `School`, `SchoolDetails`, `SchoolAddress`, `SchoolAcademics`, `SchoolFees`, `SchoolFacilities`, `SchoolGallery`, `SchoolSection`, `SchoolAchievement`
- **CRM:** `Inquiry`, `InquiryNote`
- **Moderation:** `PendingUpdate`, `ApprovalLog`
- **Monetization (DB ready):** `FeaturedListing`, `Payment`
- **Content / SEO:** `BlogPost`, `SeoPage`
- **Compliance:** `AuditLog`

Enums: **`UserRole`**, **`SchoolStatus`**, **`InquiryStatus`**, **`PendingUpdateStatus`**, **`GalleryType`**, **`AuditAction`**.

---

## Scripts

| Script | Behaviour |
| --- | --- |
| `npm run dev` | `tsx watch src/server.ts` |
| `npm run build` | Prisma generate + `tsc` |
| `npm run typecheck` | Prisma generate + `tsc --noEmit` (on Windows EPERM errors during **`prisma generate`**, rerun or use codegen outside locked folders) |
| `npm run seed` | `tsx src/prisma/seed.ts` |
| `prisma:migrate` | Migrate dev |

---

## Notes for contributors

1. Prefer **Zod** at controller boundaries for every body/query.
2. Keep audit writes non-blocking (**`createAuditLog`** already swallows errors).
3. When adding routers, mount in **`routes/index.ts`** so `/api` prefix stays canonical.
4. Public vs admin JWT paths stay separate: **`/api/admin/blog`** reads are intentional public mounts.

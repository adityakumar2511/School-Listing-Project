# SchoolSetu Backend Documentation

**Last Updated:** May 17, 2026

Express + Prisma API for SchoolSetu: **auth (JWT, bcrypt, email/phone OTP, Google)**, taxonomy, schools, inquiries, uploads, moderation, admin tools, audit logging, AI recommendations, and (disabled) Razorpay hooks.

---

## Purpose

- Serve JSON under **`/api`** for the Next.js app.
- Persist schools, taxonomy, inquiries, pending profile updates, blog posts, and audit logs in PostgreSQL.
- Optional integrations when env vars exist: **Twilio** (SMS — only if **`TWILIO_ACCOUNT_SID`** is set), **SMTP/nodemailer** (if **`SMTP_HOST`** is set), Cloudinary (images), OpenAI (`/ai`), Resend (email fallback where wired).

---

## Tech stack

| Package | Role |
| --- | --- |
| `express` | HTTP app and routers |
| `typescript` | Types across controllers and services |
| `tsx` | Dev server / scripts |
| `prisma`, `@prisma/client` | Schema at **`prisma/schema.prisma`**, migrations, DB access; client generated to **`src/generated/prisma`** |
| `zod` | Request validation |
| **`bcrypt`** | Password hashing |
| `jsonwebtoken` | JWT for `Bearer` auth (**7-day** expiry; payload **`id`**, **`role`**, **`email`**, **`phone`**, **`name`**) |
| **`nodemailer`** | Optional SMTP email (OTP / notifications when **`SMTP_HOST`** configured) |
| `helmet`, `cors`, `express-rate-limit` | Security and throttling (`otpRateLimit` on sensitive auth endpoints) |
| `morgan` | Request logging |
| `winston` | Structured logging (`src/config/logger.ts`) |
| `twilio` | SMS when configured |

`pino` is listed in `package.json` but the app imports **Winston** from `logger.ts`.

**Dev dependencies:** `@types/bcrypt`, `@types/nodemailer`, etc.

---

## Directory layout

```text
backend/
├── Backend.md
├── package.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
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
    ├── generated/prisma/      # Prisma client output (see generator block in schema)
    ├── middleware/
    │   ├── auth.ts            # requireAuth, requireRole
    │   ├── audit.middleware.ts # Present but not registered in app.ts
    │   ├── error-handler.ts
    │   └── security.ts        # cors, helmet, apiRateLimit, otpRateLimit
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
    │   ├── audit.service.ts      # createAuditLog, extractActor
    │   ├── cloudinary.service.ts
    │   ├── otpService.ts         # Twilio when configured; dev/terminal path otherwise
    │   ├── smtp.service.ts       # Optional SMTP (when SMTP_HOST set)
    │   ├── razorpay.service.ts
    │   ├── resend.service.ts
    │   └── twilioService.ts
    └── utils/
        ├── async-handler.ts
        └── http-error.ts
```

---

## Environment

Load variables from **`backend/.env`**. `env.ts` validates required and optional vars. Minimum for core behaviour:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signs JWTs (parent/school/admin) |
| `FRONTEND_URL` | Allowed CORS origin |
| `PORT` | API port (default in dev) |

**Optional — email (OTP, mail):**

| Variable | Notes |
| --- | --- |
| `SMTP_HOST` | **SMTP** host — **`smtp.service`** treats SMTP as configured only when **`SMTP_HOST`**, **`SMTP_PORT`**, **`SMTP_USER`**, and **`SMTP_PASS`** are all set |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` / `SMTP_PASS` | Credentials |

**Optional — SMS:**

| Variable | Notes |
| --- | --- |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, … | **Twilio is disabled** unless `TWILIO_ACCOUNT_SID` (and related) are present |

Other optional: `CLOUDINARY_*`, `OPENAI_API_KEY`, Resend keys, Razorpay keys (`SCHOOL_REGISTRATION_EMAIL`, `ADMIN_NOTIFICATION_PHONE`, etc.). Missing providers cause graceful skips (e.g. upload returns 503 without Cloudinary; AI falls back where implemented).

---

## Authentication (rebuilt)

All routes below are prefixed with **`/api/auth`** (see `auth.routes.ts`).

### Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/register/parent` | **name**, **email**, **password**, **phone (optional)** → creates/updates user path → sends **email OTP** (`OtpType.EMAIL_VERIFY`). |
| POST | `/register/school` | Multi-field **school + owner** registration → **email OTP**. |
| POST | `/verify-email-otp` | **email** + **otp** → sets **`isEmailVerified`**, returns **JWT**. |
| POST | `/login` | **email** + **password** → **JWT** if **`isEmailVerified`** (and password matches). |
| POST | `/send-otp` | **phone** → OTP for phone login; **dev:** `[DEV OTP] Phone: … OTP: …`; **Twilio** if configured. |
| POST | `/verify-otp` | **phone** + **otp** → verify, upsert user, **`isPhoneVerified`** as applicable → **JWT**. |
| POST | `/forgot-password` | **email** → **password reset** OTP (`OtpType.PASSWORD_RESET`); **dev:** console / `[DEV EMAIL OTP]` style logging. |
| POST | `/reset-password` | **email** + **otp** + **newPassword** → updates **`passwordHash`**. |
| POST | `/google` | **googleId** + **email** + **name** → upsert user → **JWT**. |

### JWT

- **Header:** `Authorization: Bearer <token>`
- **Expiry:** 7 days
- **Payload claims:** `id`, `role`, `email`, `phone`, `name`

### Passwords

- Stored as **`passwordHash`** on **`User`** using **bcrypt**.

### Middleware (`middleware/auth.ts`)

- **`requireAuth`** — Attaches `request.user` from JWT.
- **`requireRole(...roles)`** — Ensures `user.role` is one of **`parent`** | **`school`** | **`admin`**.

### Development logging

- **Email OTP:** e.g. `[DEV EMAIL OTP] To: user@example.com OTP: 123456` (see `auth.controller.ts`).
- **Phone OTP:** `[DEV OTP] Phone: … OTP: …`.
- **Twilio** activates only when **`TWILIO_ACCOUNT_SID`** exists.
- **SMTP** activates when **`SMTP_HOST`** exists; otherwise email OTP is logged rather than sent, depending on branch (Resend may still apply in some code paths).

### Seeded admin

- **`npm run seed`** (`prisma/seed.ts`) creates an admin user **`adityak4724@gmail.com`** with password **`Admin@123`** (via **`ADMIN_DEFAULT_PASSWORD`**, bcrypt-hashed). Adjust the constant if you change credentials locally.

---

## Prisma: `User` and `OtpCode`

### `User`

- **`name`**, **`email`** (`String?`, **unique**), **`phone`** (`String?`, **unique**)
- **`passwordHash`** (`String?`, mapped to `password_hash`)
- **`googleId`** (`String?`, **unique**)
- **`isEmailVerified`**, **`isPhoneVerified`** (booleans, default false)
- **`role`**: **`UserRole`** enum — **`parent`** | **`school`** | **`admin`**
- Relations: inquiries, owned schools, pending updates, etc.

### `OtpCode`

- **`identifier`**: email or phone string
- **`type`**: **`OtpType`** — **`EMAIL_VERIFY`** | **`PHONE_LOGIN`** | **`PASSWORD_RESET`**
- **`code`**, **`expiresAt`**, **`used`** (boolean)

---

## Route map (`/api` prefix)

### Auth (`/api/auth`)

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| POST | `/auth/register/parent` | No | Parent registration + email OTP |
| POST | `/auth/register/school` | No | School registration + email OTP |
| POST | `/auth/verify-email-otp` | No | Verify email, JWT |
| POST | `/auth/login` | No | Email/password JWT |
| POST | `/auth/send-otp` | No | Phone OTP |
| POST | `/auth/verify-otp` | No | Phone OTP verify, JWT |
| POST | `/auth/forgot-password` | No | Reset OTP |
| POST | `/auth/reset-password` | No | New password |
| POST | `/auth/google` | No | Google upsert, JWT |

### Core API

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/health` | No | `{ status, service, env, twilio.configured, payments.enabled: false }` (shape as implemented) |
| GET | `/admin/blog` | No | Published blog posts (`BlogPost.publishedAt` set) |
| GET | `/admin/blog/:slug` | No | Single published post |
| GET | `/schools` | No | **Approved** schools only; **`limit` max 1000**, pagination, filters |
| GET | `/schools/me` | Yes | Owner’s school + relations (**school** user) |
| GET | `/schools/:slug` | No | Approved school detail by slug |
| POST | `/schools` | Yes | Transaction: creates **`School`** (often **`pending`**) + nested rows; see controller for conflicts |
| PUT | `/schools/:id` | **school** or **admin** | **`PendingUpdate`** profile payload (always queues moderation on this path) |
| GET | `/inquiries` | **admin** | Platform-wide inquiries |
| GET | `/inquiries/for-school` | **school**, **admin** | Inquiries for the caller’s owned school |
| GET | `/inquiries/my` | **parent** | Caller’s inquiries |
| POST | `/inquiries` | **parent** | Create; **409** if duplicate within last **7 days** (same parent+school + class) |
| PUT | `/inquiries/:id/status` | **school**, **admin** | Inquiry status |
| POST | `/inquiries/:id/notes` | **school**, **admin** | Add **`InquiryNote`** |
| POST | `/ai/recommend` | No | Recommendation payload (OpenAI when configured) |
| POST | `/upload/image` | **school**, **admin** | Body **`{ imageBase64 }`** → Cloudinary; **503** if not configured |
| DELETE | `/upload/image/:id` | **school**, **admin** | **`school_gallery` id** — deletes Cloudinary asset (when inferable) and DB row |
| POST | `/payments/create-order` | — | **`503`** wrapper |
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
| PUT | `/schools/:id/edit` | **Direct** **`prisma.school.update`** (`SCHOOL_EDITED`). Does **not** use **`PendingUpdate`** queue. |
| DELETE | `/schools/:id` | Delete |
| PUT | `/schools/:id/toggle-featured` | Featured flag |
| GET | `/moderation` | Pending **`PendingUpdate`** queue |
| PUT | `/moderation/:id/approve` | Approve and merge payload into **`School`** and related rows |
| PUT | `/moderation/:id/reject` | Reject pending item |
| GET | `/audit-logs/stats`, `/audit-logs` | Audit listing + aggregates |
| POST | `/blog` | Create **`BlogPost`** |
| PUT | `/blog/:id` | Update |
| DELETE | `/blog/:id` | Delete |

---

## Blog (`blog.controller.ts`)

- **Public reads** attach to **`apiRouter`** in **`routes/index.ts`** **before** `apiRouter.use("/admin", …)` so paths are **`/api/admin/blog`** without admin JWT.
- **Writes** stay on **`adminRouter`** (`/api/admin/blog`).

---

## Schools controller (high level)

- **`listSchools`** — **Approved-only** public listing; query params validated with **`limit`** 1–**1000**; **`sort`** includes **`newest`** where wired.
- **`getSchool`** — By slug for **approved** schools.
- **`getMySchool`** — Owner (**`school`**) resolves via **`School.ownerId`**.
- **`createSchool`** — Transaction creating nested rows; rejects second school per owner (**409**) where enforced.
- **`updateSchool`** — Builds **`oldValue`** from DB; **`PendingUpdate`** with **`newValue`** body. (**Admins who need immediate top-level **`School`** field mutations use **`PUT /api/admin/schools/:id/edit`** instead.**)

**Registration flow:** Owners typically register via **`POST /api/auth/register/school`**, verify email, and remain **`pending`** until **`PUT /api/admin/schools/:id/approve`**. Only **`approved`** schools are returned from **`GET /api/schools`** and **`GET /api/schools/:slug`**.

Gallery entries for the dashboard combine **upload** (returns **`secure_url`**) then **school update** payloads that submit new **`gallery`** arrays in **`newValue`**; approve flow reconciles deletes vs Cloudinary URLs per **`admin.controller.ts`**.

---

## Media controller

- **`POST /api/upload/image`** — Validates **`imageBase64`** via Zod; accepts **`data:image/…;base64,…`** or raw base64.
- **`DELETE /api/upload/image/:id`** — **`SchoolGallery`** id; **`assertSchoolAccess`** enforces ownership (or admin behaviour as implemented).

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

- **`auth.controller`** logs **`ADMIN_LOGIN`** after successful **`POST /auth/login`** when **`user.role === "admin"`**, and after **`POST /auth/verify-otp`** when the resulting user is an **admin**.
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

Enums: **`UserRole`**, **`OtpType`**, **`SchoolStatus`** (`pending`, `approved`, `rejected`), **`InquiryStatus`**, **`PendingUpdateStatus`**, **`GalleryType`**, **`AuditAction`**.

---

## Scripts

| Script | Behaviour |
| --- | --- |
| `npm run dev` | `tsx watch src/server.ts` |
| `npm run build` | `prisma generate --schema=prisma/schema.prisma` + `tsc` |
| `npm run typecheck` | Prisma generate + `tsc --noEmit` (on Windows EPERM errors during **`prisma generate`**, rerun or use codegen outside locked folders) |
| `npm run seed` | `tsx prisma/seed.ts` |
| `prisma:migrate` | `prisma migrate dev --schema=prisma/schema.prisma` |

---

## Notes for contributors

1. Prefer **Zod** at controller boundaries for every body/query.
2. Keep audit writes non-blocking (**`createAuditLog`** already swallows errors).
3. When adding routers, mount in **`routes/index.ts`** so `/api` prefix stays canonical.
4. Public vs admin JWT paths stay separate: **`/api/admin/blog`** reads are intentional public mounts.

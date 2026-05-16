# SchoolSetu

SchoolSetu is a full-stack school discovery and admission platform for Tier-2 and Tier-3 Indian cities. It helps parents discover schools, compare options, request admission callbacks, and use AI-assisted recommendations. It gives schools a digital presence and gives platform admins a foundation for moderation, approvals, featured placements, SEO pages, lead quality control, and a complete audit trail of every admin action.

The current target cities are:

| City | Purpose in the product |
| --- | --- |
| Prayagraj | Primary seeded city and strongest current school coverage. |
| Banda | Target expansion city for affordable discovery. |
| Kanpur | Target expansion city for board and category pages. |
| Jhansi | Target expansion city with boarding and hostel search needs. |
| Lucknow | Target expansion city for private and premium schools. |

## Project Overview

SchoolSetu serves three audiences:

| Audience | What they do in SchoolSetu |
| --- | --- |
| Parents | Search schools by city, board, query, facilities, category, fees, and admission status. Compare schools, view detail pages, request admission inquiries via WhatsApp or a form, and ask the AI assistant for recommendations. |
| Schools | Register or claim listings, manage profile information, receive inquiries, upload media, and buy featured placements. Registration and update flows are scaffolded. |
| Platform admins | Moderate new schools, review pending updates, approve or reject schools, curate SEO pages, manage listing quality, and review a full audit log of every team and master admin action. |

## Problem Statement

School discovery in Tier-2 and Tier-3 cities is still fragmented. Many parents depend on WhatsApp groups, offline word of mouth, outdated school websites, or paid admission agents. Schools often have incomplete digital footprints, weak SEO, no structured inquiry capture, and no reliable way to present facilities, fees, board affiliation, or admission status.

SchoolSetu solves this by creating:

- A searchable directory for local schools with client-side filters (board, fees, gender, facilities, special focus).
- SEO pages for cities, boards, and categories with JSON-LD structured data.
- Structured school profiles with fees, academics, facilities, gallery, and contact actions.
- WhatsApp-first inquiry capture with an OTP-verified inline form.
- AI-assisted recommendations based on parent preferences.
- Admin moderation so listings can be trusted before going live.
- A full audit log recording every admin action with before/after state.

## Tech Stack

| Layer | Technology | Why it is used |
| --- | --- | --- |
| Frontend | Next.js App Router | SSR, SSG, dynamic metadata, SEO pages, and nested route architecture. |
| Frontend | React 19 | Component model for interactive discovery, compare, and chat flows. |
| Frontend | TypeScript | End-to-end type safety for data shapes, UI props, and API normalization. |
| Frontend | Tailwind CSS 4 | Token-driven styling with fast iteration and responsive layouts. |
| Frontend | React Icons | Consistent icon set (Feather, Material, Heroicons) replacing all emojis in UI. |
| Frontend | Zustand | Lightweight client state for the compare shortlist. |
| Frontend | TanStack Query | Server state for school listings and async fetch lifecycle. |
| Frontend | Framer Motion | Small chat/message animations and polished UI transitions. |
| Frontend | Zod | Runtime validation schemas for forms. |
| Frontend | React Hook Form | Efficient form state for inquiry and auth forms. |
| Backend | Node.js | JavaScript runtime shared with the frontend ecosystem. |
| Backend | Express 5 | Modular HTTP API with simple route/controller boundaries. |
| Backend | TypeScript | Stronger contracts across controllers, services, middleware, and Prisma. |
| Backend | Prisma ORM | Typed database access and PostgreSQL schema modeling. |
| Backend | PostgreSQL | Relational fit for users, schools, cities, boards, inquiries, payments, moderation, audit logs, and SEO content. |
| Backend | JWT | Stateless API authentication for parent, school, and admin roles. |
| Backend | Helmet | Secure HTTP response headers. |
| Backend | express-rate-limit | Global API throttling and tighter OTP throttling. |
| Backend | Zod | Request validation for OTP, schools, inquiries, payments, and AI inputs. |

## Repository Structure

```text
.
|-- README.md
|-- package.json
|-- package-lock.json
|-- backend/
|   |-- Backend.md
|   |-- package.json
|   |-- tsconfig.json
|   |-- eslint.config.mjs
|   |-- src/
|   |   |-- app.ts
|   |   |-- server.ts
|   |   |-- config/
|   |   |   |-- env.ts
|   |   |   |-- prisma.ts
|   |   |-- controllers/
|   |   |   |-- admin.controller.ts
|   |   |   |-- ai.controller.ts
|   |   |   |-- auth.controller.ts
|   |   |   |-- inquiries.controller.ts
|   |   |   |-- media.controller.ts
|   |   |   |-- payments.controller.ts
|   |   |   |-- schools.controller.ts
|   |   |   |-- taxonomy.controller.ts
|   |   |-- data/
|   |   |   |-- mock-schools.ts
|   |   |-- middleware/
|   |   |   |-- audit.middleware.ts       ← NEW
|   |   |   |-- auth.ts
|   |   |   |-- error-handler.ts
|   |   |   |-- security.ts
|   |   |-- prisma/
|   |   |   |-- schema.prisma
|   |   |   |-- seed.ts
|   |   |-- routes/
|   |   |   |-- admin.routes.ts
|   |   |   |-- ai.routes.ts
|   |   |   |-- auth.routes.ts
|   |   |   |-- index.ts
|   |   |   |-- inquiries.routes.ts
|   |   |   |-- media.routes.ts
|   |   |   |-- payments.routes.ts
|   |   |   |-- schools.routes.ts
|   |   |   |-- search.routes.ts
|   |   |   |-- taxonomy.routes.ts
|   |   |-- services/
|   |   |   |-- ai.service.ts
|   |   |   |-- audit.service.ts          ← NEW
|   |   |   |-- cloudinary.service.ts
|   |   |   |-- razorpay.service.ts
|   |   |   |-- resend.service.ts
|   |   |   |-- twilio.service.ts
|   |   |-- utils/
|   |       |-- async-handler.ts
|   |       |-- http-error.ts
|-- frontend/
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
    |   |-- auth-token.ts                 ← NEW
    |   |-- schools-api.ts                ← NEW
    |   |-- utils.ts
    |-- store/
    |   |-- compare-store.ts
    |-- components/
    |   |-- ai/
    |   |   |-- ai-chat.tsx
    |   |-- inquiry/
    |   |   |-- inquiry-form.tsx
    |   |-- schools/
    |   |   |-- hero-search.tsx            ← NEW
    |   |   |-- mobile-sticky-bar.tsx      ← NEW
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
        |   |-- audit-logs/               ← NEW
        |   |   |-- page.tsx
        |   |-- [section]/
        |       |-- page.tsx
        |-- dashboard/page.tsx
        |-- school/dashboard/page.tsx
        |-- (public)/
            |-- page.tsx
            |-- about/page.tsx
            |-- ai-recommend/page.tsx
            |-- auth/
            |   |-- login/page.tsx         ← NEW (role selector)
            |   |-- parent/
            |   |   |-- login/
            |   |       |-- page.tsx       ← NEW
            |   |       |-- parent-login-form.tsx  ← NEW
            |   |-- school/
            |   |   |-- login/
            |   |       |-- page.tsx       ← NEW
            |   |       |-- school-login-form.tsx  ← NEW
            |   |-- register/page.tsx
            |   |-- verify-otp/page.tsx
            |-- blog/
            |   |-- page.tsx
            |   |-- [slug]/page.tsx        ← NEW (3 static articles)
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

### What each area does

| Path | Responsibility |
| --- | --- |
| `backend/src/services/audit.service.ts` | `createAuditLog` writes to `AuditLog` inside try/catch so it never blocks the main operation. `extractActor` extracts actor metadata from Express requests. |
| `backend/src/middleware/audit.middleware.ts` | Response-intercepting middleware that wraps `res.json` and fires `createAuditLog` only on 2xx responses. |
| `backend/src/controllers/admin.controller.ts` | Full Prisma-backed admin operations: school list, approve/verify, reject, edit, delete, featured toggle, moderation queue, plus `listAuditLogs` and `auditLogStats` handlers. |
| `backend/src/routes/admin.routes.ts` | All admin routes including `GET /audit-logs`, `GET /audit-logs/stats`, `PUT /schools/:id/edit`, `DELETE /schools/:id`, `PUT /schools/:id/toggle-featured`. |
| `backend/src/prisma/schema.prisma` | Adds `AuditAction` enum (16 values) and `AuditLog` model with indexes on `actorId`, `action`, `targetType+targetId`, and `createdAt`. |
| `frontend/lib/auth-token.ts` | `getAuthToken`, `setAuthToken`, `clearAuthToken`, and `authHeaders()` using localStorage key `schoolsetu_token`. |
| `frontend/lib/schools-api.ts` | `NormalizedSchool` type and `normalizeSchool` function that flatten Prisma and mock school shapes into a single UI-compatible object. API fetchers: `fetchSchoolsList`, `fetchSchoolBySlug`. |
| `frontend/app/admin/audit-logs/page.tsx` | Full audit log viewer: stats bar, action/date/search filters, color-coded table with row highlight for danger actions, side-drawer diff viewer, CSV export. |
| `frontend/app/(public)/page.tsx` | Parent-only homepage. 8 sections: Hero, Trust Bar, Featured Schools, Browse by Category, How It Works, AI CTA, Admissions Open, Helpful Guides. All React Icons, no emojis. |
| `frontend/app/(public)/auth/login/page.tsx` | Role selector: two cards for Parent Login and School Admin Login. |
| `frontend/app/(public)/auth/parent/login/` | Dedicated parent login with Google Sign-In and Phone OTP tabs. |
| `frontend/app/(public)/auth/school/login/` | Dedicated school admin login with Email/Password and Phone OTP tabs. |
| `frontend/app/(public)/blog/[slug]/page.tsx` | Three fully-written English articles: Prayagraj admission guide, CBSE vs UP Board comparison, top hostel schools review. |
| `frontend/app/(public)/for-schools/page.tsx` | School-facing landing page: hero, benefits, how it works, what's included checklist, final CTA. |
| `frontend/components/schools/hero-search.tsx` | Client-side search bar on the homepage with city badge and keyboard support. |
| `frontend/components/schools/mobile-sticky-bar.tsx` | Mobile-only sticky bottom bar with Call, WhatsApp, and Inquiry buttons on school detail pages. |
| `frontend/components/site-header.tsx` | Client component with a hamburger menu for mobile. Slide-down drawer with nav links, closes on route change or outside click. |

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd "6. School Listing Project"
npm install
```

### 2. Configure environment

Create `backend/.env`:

```bash
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/schoolsetu
JWT_SECRET=replace-with-a-long-local-secret
```

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Provider keys are optional for local development. When omitted, services return skipped responses or deterministic mock responses.

### 3. Run Prisma migration

```bash
cd backend
npx prisma migrate dev --name add_audit_log
```

### 4. Generate Prisma client

```bash
npm run prisma:generate --workspace backend
```

### 5. Run development servers

```bash
npm run dev
```

This runs:

- Frontend at `http://localhost:3000`
- Backend at `http://localhost:4000`

### 6. Build and typecheck

```bash
npm run typecheck
npm run build
```

## Environment Variables

### Frontend

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Recommended | `lib/schools-api.ts`, listings, detail page, AI chat, audit logs | Base URL for the backend, e.g. `http://localhost:4000`. Falls back to local mock data for school listings when absent. |
| `NEXTAUTH_URL` | Pending | Auth.js integration | Needed when Google OAuth is fully wired through NextAuth/Auth.js. |
| `NEXTAUTH_SECRET` | Pending | Auth.js integration | Secret for Auth.js session signing. |
| `GOOGLE_CLIENT_ID` | Pending | Auth.js integration | Google OAuth client id. |
| `GOOGLE_CLIENT_SECRET` | Pending | Auth.js integration | Google OAuth secret. |

### Backend

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `config/env.ts` | Runtime mode. Defaults to `development`. |
| `PORT` | No | `server.ts` | API port. Defaults to `4000`. |
| `FRONTEND_URL` | No | CORS middleware | Allowed frontend origin. Defaults to `http://localhost:3000`. |
| `DATABASE_URL` | Required for Prisma | Prisma | PostgreSQL connection string. |
| `JWT_SECRET` | Required in production | Auth middleware, OTP verify | Signs 7-day JWTs. Defaults to `development-secret`. |
| `OPENAI_API_KEY` | Optional | AI service | Enables OpenAI recommendations. Missing key returns mock response. |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio service | Twilio account identifier for SMS and WhatsApp. |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio service | Twilio auth token. |
| `TWILIO_PHONE_NUMBER` | Optional | Twilio SMS OTP | SMS sender number. |
| `TWILIO_WHATSAPP_NUMBER` | Optional | Twilio WhatsApp | WhatsApp sender number. |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary service | Cloudinary account name. |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary service | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary service | Cloudinary secret. |
| `RESEND_API_KEY` | Optional | Resend service | Enables inquiry confirmation emails. |
| `RAZORPAY_KEY_ID` | Optional | Razorpay service | Enables order creation. |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay service/controller | Order API and payment signature verification. |
| `RAZORPAY_WEBHOOK_SECRET` | Pending | Webhook hardening | Webhook signature verification not yet implemented. |

## Workspace Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `npm run dev` | `npm-run-all --parallel dev:frontend dev:backend` | Runs both apps concurrently. |
| `npm run dev:frontend` | `npm run dev --workspace frontend` | Starts Next.js dev server with Turbopack. |
| `npm run dev:backend` | `npm run dev --workspace backend` | Starts Express with `tsx watch`. |
| `npm run build` | Frontend build then backend build | Produces `.next` and `backend/dist`. |
| `npm run typecheck` | Frontend typecheck then backend typecheck | Runs `tsc --noEmit` in both workspaces. |

## Feature Coverage

### Implemented

- **Homepage** — 8-section parent-focused landing page: Hero with search, Trust Bar, Featured Schools, Browse by Category, How It Works, AI CTA, Admissions Open, Helpful Guides. React Icons throughout, no emojis.
- **School listing** — `/schools/[city]` with client-side filters: board, gender, fee range, facilities, special focus, and free-text search. Sort by relevance, fee low/high, newest.
- **School detail page** — Breadcrumbs, school header, quick stats strip, action buttons (Call/WhatsApp/Inquiry), About section, Fee Structure table, Facilities grid, Special Programs, Nearby Schools, sticky sidebar inquiry CTA, mobile sticky bar.
- **City pages** — `/schools/prayagraj` (and other city slugs) with JSON-LD `ItemList`, breadcrumbs, stats strip, and listing client.
- **Static blog** — Blog listing page and 3 fully-written English articles (admission guide, CBSE vs UP Board, hostel schools review).
- **Auth system** — Role selector at `/auth/login`, dedicated parent login (Google + Phone OTP), dedicated school admin login (Email/Password + Phone OTP). All copy in English.
- **For Schools page** — 5-section school-facing landing page with benefits, how it works, and free listing CTA.
- **Audit Log system**:
  - `AuditAction` enum (16 actions) + `AuditLog` model in Prisma schema.
  - `createAuditLog` service that never blocks main operations.
  - `extractActor` helper for Express requests.
  - `auditLog` response-intercepting middleware.
  - Full Prisma-backed admin controller: approve, reject, edit, delete, toggle featured, moderation queue.
  - `ADMIN_LOGIN` logged on successful OTP verification for admin users.
  - `GET /api/admin/audit-logs` — filterable, paginated audit log API.
  - `GET /api/admin/audit-logs/stats` — 30-day action counts, groupBy actor, danger actions.
  - Frontend audit log page: stats cards, filters, color-coded table, red-row highlights for deletes, side-drawer diff viewer (before/after JSON), CSV export.
- **Mobile header** — Hamburger menu in site header with slide-down drawer, auto-close on route change/outside click.
- **Inquiry form** — Zod + React Hook Form, authenticated API submission, success/duplicate/error states. All labels in English.
- **OTP backend** — Persistent `OtpRecord`, 5-minute expiry, rate limit, JWT issuance.
- **Taxonomy API** — Cities, states, boards with approved-school counts.
- **Inquiry API** — Create, status update, notes with duplicate prevention.
- **All UI copy** — Fully converted from Hinglish to professional English across all pages and components.

### Partially Implemented

- School registration and update endpoints return moderation-shaped responses but do not yet persist full payloads into all Prisma tables.
- Media upload accepts `filePath` instead of multipart uploads.
- Razorpay webhook returns `{ received: true }` without signature verification.
- AI fallback references `mockSchools`, currently empty in the backend.
- Prisma migration for `AuditLog` must be run manually when the Neon DB is reachable (`npx prisma migrate dev --name add_audit_log`).

### Pending

- Complete Auth.js Google OAuth integration.
- School claim flow and school profile editing UI.
- Admin moderation UI connected to `PendingUpdate` and `ApprovalLog`.
- File upload middleware with `multer` + Cloudinary browser upload.
- Payment persistence, webhook verification, and featured listing activation.
- ISR configuration for SEO pages.
- Request logging, observability, and tests.
- Spam detection and lead quality scoring.
- School ownership model for `school` role.

## Architecture Decisions

### Why Next.js App Router

SchoolSetu depends on SEO. Parents search for phrases such as "CBSE schools in Prayagraj" or "boarding schools in Jhansi". The App Router gives server components, static generation, dynamic metadata, route groups, and easy city/board/category SEO pages. Interactive pieces — compare, chat, filters, forms — stay as client components.

### Why PostgreSQL over MongoDB

The domain is relational: schools belong to cities, states, and boards; inquiries connect parents and schools; featured listings connect payments and schools; audit logs record actors, targets, and before/after state. PostgreSQL enforces this structure cleanly and Prisma provides typed access.

### Why a modular monolith

The product is early-stage but domain-heavy. A modular monolith keeps deployment simple while preserving boundaries through controllers, routes, services, middleware, and Prisma models. It avoids premature microservices while making later extraction possible.

### Why TypeScript end-to-end

School data is reused across listing cards, detail pages, AI recommendations, inquiry flows, and backend responses. TypeScript reduces shape drift, catches route/controller mistakes, and keeps frontend normalization safer. The `NormalizedSchool` type in `frontend/lib/schools-api.ts` is the single contract between backend Prisma responses and all UI components.

### Why audit logs never block main operations

All `createAuditLog` calls are wrapped in their own try/catch. If the audit write fails (network, DB error, schema mismatch), the admin operation still completes and returns success. Audit failures are logged to `console.error` for visibility without breaking the user flow.

## API Overview

| Method | Route | Auth required | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Health check. |
| `POST` | `/api/auth/send-otp` | No | Sends OTP for phone login. Rate limited. |
| `POST` | `/api/auth/verify-otp` | No | Verifies OTP, upserts user, returns JWT. Logs `ADMIN_LOGIN` for admin users. |
| `POST` | `/api/auth/google` | No | Placeholder; Google OAuth handled by frontend Auth.js. |
| `GET` | `/api/schools` | No | Lists approved schools with filters and pagination. |
| `GET` | `/api/schools/:slug` | No | Returns one approved school by slug. |
| `POST` | `/api/schools` | `school` or `admin` | Submits school registration for moderation. |
| `PUT` | `/api/schools/:id` | `school` or `admin` | Submits school update to moderation queue. |
| `GET` | `/api/search` | No | Alias for `GET /api/schools`. |
| `POST` | `/api/inquiries` | `parent` | Creates an admission inquiry. Prevents duplicates within 7 days. |
| `PUT` | `/api/inquiries/:id/status` | `school` or `admin` | Updates inquiry status. |
| `POST` | `/api/inquiries/:id/notes` | `school` or `admin` | Adds a note to an inquiry. |
| `POST` | `/api/ai/recommend` | No | Sends preferences to AI recommendation service. |
| `GET` | `/api/admin/schools` | `admin` | Lists all schools for admin review (Prisma-backed). |
| `PUT` | `/api/admin/schools/:id/approve` | `admin` | Approves school. Updates status, logs `SCHOOL_VERIFIED`. |
| `PUT` | `/api/admin/schools/:id/reject` | `admin` | Rejects school. Updates status, logs `SCHOOL_REJECTED`. |
| `PUT` | `/api/admin/schools/:id/edit` | `admin` | Updates school fields. Logs `SCHOOL_EDITED` with changed fields diff. |
| `DELETE` | `/api/admin/schools/:id` | `admin` | Deletes school. Saves pre-delete data, logs `SCHOOL_DELETED`. |
| `PUT` | `/api/admin/schools/:id/toggle-featured` | `admin` | Toggles featured status. Logs `SCHOOL_FEATURED_TOGGLED`. |
| `GET` | `/api/admin/moderation` | `admin` | Lists pending moderation items. |
| `PUT` | `/api/admin/moderation/:id/approve` | `admin` | Approves pending update. |
| `PUT` | `/api/admin/moderation/:id/reject` | `admin` | Rejects pending update. |
| `GET` | `/api/admin/audit-logs` | `admin` | Paginated audit log with filters: actorId, action, targetType, targetId, from, to, search. |
| `GET` | `/api/admin/audit-logs/stats` | `admin` | 30-day stats: total actions, groupBy action type, groupBy actor, recent danger actions. |
| `POST` | `/api/upload/image` | `school` or `admin` | Uploads image via Cloudinary. |
| `DELETE` | `/api/upload/image/:id` | `school` or `admin` | Deletes Cloudinary asset. |
| `POST` | `/api/payments/create-order` | `school` or `admin` | Creates Razorpay order. |
| `POST` | `/api/payments/verify-payment` | `school` or `admin` | Verifies Razorpay signature. |
| `POST` | `/api/payments/webhook` | No | Razorpay webhook placeholder. |
| `GET` | `/api/cities` | No | Lists cities with approved school counts. |
| `GET` | `/api/states` | No | Lists states with cities that have approved schools. |
| `GET` | `/api/boards` | No | Lists boards with approved school counts. |

## Database Overview

| Model | Purpose |
| --- | --- |
| `User` | Parents, schools, and admins. Stores email, phone, role, optional Google id. |
| `OtpRecord` | OTP codes, expiry, used flag, and indexes for phone and expiry lookup. |
| `State` | State taxonomy. |
| `City` | City taxonomy with slug and `hasSchools`. |
| `Board` | Education boards (CBSE, ICSE, UP Board, etc.). |
| `School` | Core listing record with city, board, status, type, medium, featured flag. |
| `SchoolDetails` | Principal, year, affiliation, website, email, phone, WhatsApp. |
| `SchoolAddress` | Address, pincode, coordinates, Google Maps URL. |
| `SchoolAcademics` | Streams, class range, admission window, required documents. |
| `SchoolFees` | Admission, tuition, transport, hostel, exam fees. |
| `SchoolFacilities` | Boolean facility flags (library, labs, hostel, transport, wifi, CCTV, etc.). |
| `SchoolGallery` | Cloudinary image/video URLs, captions, and ordering. |
| `SchoolSection` | Flexible content sections (sports, hostel, IIT/NEET). |
| `SchoolAchievement` | Awards and accomplishments. |
| `Facility` | Facility taxonomy for search/filter UI. |
| `Inquiry` | Admission lead linking parent and school. |
| `InquiryNote` | School/admin notes on an inquiry. |
| `PendingUpdate` | Proposed school profile changes waiting for review. |
| `ApprovalLog` | Admin approval/rejection history for pending updates. |
| `FeaturedListing` | Paid placement windows tied to a school and optional payment. |
| `Payment` | Razorpay order/payment references and featured listing plan metadata. |
| `BlogPost` | SEO/blog content. |
| `SeoPage` | Custom metadata/content for city, board, category, or other landing pages. |
| `AuditLog` | **NEW** — Complete record of every admin action with actor, target, before/after JSON, IP, user agent, and timestamp. |

### AuditAction enum values

`SCHOOL_VERIFIED`, `SCHOOL_REJECTED`, `SCHOOL_EDITED`, `SCHOOL_DELETED`, `SCHOOL_FEATURED_TOGGLED`, `SCHOOL_CREATED`, `USER_DEACTIVATED`, `USER_REACTIVATED`, `USER_ROLE_CHANGED`, `TEAM_MEMBER_CREATED`, `TEAM_MEMBER_DEACTIVATED`, `TEAM_MEMBER_PERMISSIONS_UPDATED`, `INQUIRY_STATUS_CHANGED`, `INQUIRY_DELETED`, `ADMIN_LOGIN`, `ADMIN_LOGOUT`.

## Authentication Flow

### OTP flow

1. Frontend collects a phone number.
2. Frontend calls `POST /api/auth/send-otp`.
3. Backend generates a 6-digit OTP, marks previous unused OTPs used, creates a new `OtpRecord` with 5-minute expiry.
4. `twilioService.sendSmsOtp` sends the SMS, or returns skipped if unconfigured.
5. User submits `{ phone, otp }` to `POST /api/auth/verify-otp`.
6. Backend finds an unused unexpired OTP, marks it used in a transaction, upserts parent `User`.
7. Backend signs `{ id, role, phone }` JWT with 7-day expiry.
8. If the user is an admin, `ADMIN_LOGIN` is written to `AuditLog`.
9. Frontend stores the token via `lib/auth-token.ts` and sends it as `Authorization: Bearer <token>`.

### JWT payload shape

```ts
{ id: string; role: "parent" | "school" | "admin"; phone?: string }
```

## Service Integrations

| Service | File | Project role | Dev fallback |
| --- | --- | --- | --- |
| Twilio | `backend/src/services/twilio.service.ts` | Sends SMS OTP and WhatsApp messages. | Returns `{ skipped: true, reason, phone, otp }` when credentials are missing. |
| Cloudinary | `backend/src/services/cloudinary.service.ts` | Uploads/deletes school gallery and profile media. | Returns skipped response. |
| OpenAI | `backend/src/services/ai.service.ts` | Generates school recommendations from parent preferences. | Returns provider `mock` with empty recommendations. |
| Resend | `backend/src/services/resend.service.ts` | Sends inquiry confirmation emails. | Returns skipped response. |
| Razorpay | `backend/src/services/razorpay.service.ts` | Creates payment orders for featured listings. | Returns skipped response. |

## SEO Strategy

- `app/(public)/schools/[slug]/page.tsx` implements `generateMetadata()` for both city pages and school detail pages.
- School detail pages render JSON-LD `School` schema.
- City pages render JSON-LD `ItemList` schema.
- `generateStaticParams()` prebuilds all mock school slugs and target city slugs.
- Board pages at `/schools/board/[board]`, category pages at `/schools/category/[category]`, state pages at `/schools/state/[state]`.
- Blog articles at `/blog/[slug]` with per-post `generateMetadata()` and `generateStaticParams()`.
- All metadata descriptions are in professional English (Hinglish fully removed).

## Deployment Notes

| Component | Recommended host | Notes |
| --- | --- | --- |
| Frontend | Vercel | Best fit for Next.js App Router. Set `NEXT_PUBLIC_API_URL` to the backend URL. |
| Backend | Railway or Render | Run `npm run build --workspace backend` and `npm run start --workspace backend`. |
| Database | Neon PostgreSQL | Serverless PostgreSQL with Prisma. Run migrations before first deploy. |
| Media | Cloudinary | Store school images and galleries. |
| Email/SMS/Payments | Resend, Twilio, Razorpay | Use production keys in backend environment only. |

Before production:

- Replace all development secrets.
- Run `npx prisma migrate dev --name add_audit_log` against the hosted database.
- Seed boards, states, cities, and initial schools.
- Set correct `FRONTEND_URL` for CORS.
- Add request logging and monitoring.
- Verify Razorpay webhooks with `RAZORPAY_WEBHOOK_SECRET`.
- Complete Auth.js Google OAuth integration.

## Contributing and Development Guidelines

- Keep the project TypeScript-first. Do not introduce untyped API shapes when Zod or Prisma types can describe them.
- Use canonical design tokens: primary blue `#185FA5`, amber CTA `#EF9F27`, background `#F1EFE8`, text `#2C2C2A`, border `#D3D1C7`.
- Do not mix admin features into parent-facing pages unless the route is explicitly an admin route.
- Keep frontend server data and client interactivity separated: server routes for SEO, client components for chat, compare, forms, and filters.
- Backend controllers should validate input with Zod and delegate provider logic to services.
- Protected APIs must use `requireAuth` and `requireRole`.
- Audit logs must never block main operations — always in a separate try/catch.
- All UI copy must be in professional English. No Hinglish.
- Use React Icons (`react-icons/fi`, `react-icons/md`, `react-icons/hi`) for all icons. No emojis in UI text.
- Run these before handing off:

```bash
npm run typecheck
npm run build
```

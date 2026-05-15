# SchoolSetu

SchoolSetu is a full-stack school discovery and admission platform for Tier-2 and Tier-3 Indian cities. It helps parents discover schools, compare options, request admission callbacks, and use AI-assisted recommendations. It gives schools a digital presence and gives platform admins a foundation for moderation, approvals, featured placements, SEO pages, and lead quality control.

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
| Parents | Search schools by city, board, query, facilities, category, fees, and admission status. They can compare schools, view detail pages, request admission inquiries, and ask the AI assistant for recommendations. |
| Schools | Register or claim listings, manage profile information, receive inquiries, upload media, and buy featured placements. Some of this is scaffolded and still needs production hardening. |
| Platform admins | Moderate new schools, review pending updates, approve or reject schools, curate SEO pages, and manage listing quality. Admin endpoints and shells exist; full workflows are still pending. |

## Problem Statement

School discovery in Tier-2 and Tier-3 cities is still fragmented. Many parents depend on WhatsApp groups, offline word of mouth, outdated school websites, or paid admission agents. Schools often have incomplete digital footprints, weak SEO, no structured inquiry capture, and no reliable way to present facilities, fees, board affiliation, or admission status.

SchoolSetu solves this by creating:

- A searchable directory for local schools.
- SEO pages for cities, boards, and categories.
- Structured school profiles with fees, academics, facilities, gallery, and contact actions.
- Lead capture for admission inquiries.
- AI-assisted recommendations based on parent preferences.
- Admin moderation so listings can be trusted before going live.

## Tech Stack

| Layer | Technology | Why it is used |
| --- | --- | --- |
| Frontend | Next.js App Router | SSR, SSG, dynamic metadata, SEO pages, and nested route architecture. |
| Frontend | React 19 | Component model for interactive discovery, compare, and chat flows. |
| Frontend | TypeScript | End-to-end type safety for data shapes and UI props. |
| Frontend | Tailwind CSS 4 | Token-driven styling with fast iteration and responsive layouts. |
| Frontend | Zustand | Lightweight client state for the compare shortlist. |
| Frontend | TanStack Query | Server state for school listings and async fetch lifecycle. |
| Frontend | Framer Motion | Small chat/message animations and polished UI transitions. |
| Frontend | Zod | Runtime validation schemas for forms. |
| Frontend | React Hook Form | Efficient form state for inquiry and auth forms. |
| Backend | Node.js | JavaScript runtime shared with the frontend ecosystem. |
| Backend | Express 5 | Modular HTTP API with simple route/controller boundaries. |
| Backend | TypeScript | Stronger contracts across controllers, services, middleware, and Prisma. |
| Backend | Prisma ORM | Typed database access and PostgreSQL schema modeling. |
| Backend | PostgreSQL | Relational fit for users, schools, cities, boards, inquiries, payments, moderation, and SEO content. |
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
    |-- tsconfig.tsbuildinfo
    |-- next.config.ts
    |-- next-env.d.ts
    |-- postcss.config.mjs
    |-- eslint.config.mjs
    |-- public/
    |   |-- school-logo.svg
    |-- data/
    |   |-- schools.ts
    |-- lib/
    |   |-- api.ts
    |   |-- utils.ts
    |-- store/
    |   |-- compare-store.ts
    |-- components/
    |   |-- ai/
    |   |   |-- ai-chat.tsx
    |   |-- inquiry/
    |   |   |-- inquiry-form.tsx
    |   |-- schools/
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
        |   |-- [section]/
        |       |-- page.tsx
        |-- auth/
        |   |-- login/page.tsx
        |   |-- register/page.tsx
        |   |-- verify-otp/page.tsx
        |-- dashboard/page.tsx
        |-- school/dashboard/page.tsx
        |-- (public)/
            |-- page.tsx
            |-- about/page.tsx
            |-- ai-recommend/page.tsx
            |-- blog/page.tsx
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
| `package.json` | Root npm workspace definition and cross-workspace scripts. |
| `package-lock.json` | Reproducible install lockfile for frontend and backend packages. |
| `backend/package.json` | Backend dependencies and scripts for dev, build, typecheck, Prisma, and seed. |
| `backend/src/app.ts` | Creates the Express app, installs security middleware, JSON parsing, logging, route mounting, and error handling. |
| `backend/src/server.ts` | Starts the API server on `env.PORT`. |
| `backend/src/config/env.ts` | Validates backend environment variables with Zod and provides defaults for local development. |
| `backend/src/config/prisma.ts` | Exports the Prisma client singleton used by controllers and data helpers. |
| `backend/src/controllers/*.ts` | API behavior grouped by domain: auth, schools, inquiries, admin, AI, media, payments, taxonomy. |
| `backend/src/routes/*.ts` | Express routers that bind HTTP methods and paths to controller functions and auth middleware. |
| `backend/src/services/*.ts` | External provider wrappers for Twilio, Resend, Cloudinary, Razorpay, and OpenAI. Missing credentials return safe skipped or mock responses where implemented. |
| `backend/src/middleware/auth.ts` | JWT extraction and role authorization. |
| `backend/src/middleware/security.ts` | CORS, Helmet, global rate limit, and OTP-specific rate limit. |
| `backend/src/middleware/error-handler.ts` | Converts thrown errors into JSON responses. |
| `backend/src/data/mock-schools.ts` | Historical filename; currently contains Prisma school query helpers plus an empty `mockSchools` export for older stubs. |
| `backend/src/prisma/schema.prisma` | PostgreSQL data model for users, schools, taxonomy, inquiries, moderation, payments, blog, and SEO pages. |
| `backend/src/prisma/seed.ts` | Seeds Uttar Pradesh, target cities, boards, facility taxonomy, and sample Prayagraj schools. |
| `frontend/package.json` | Frontend dependencies and scripts. |
| `frontend/app/layout.tsx` | Root HTML layout, Google fonts, providers, header, footer, and metadata base. |
| `frontend/app/globals.css` | Tailwind import, design tokens, body styles, and `.container-shell`. |
| `frontend/app/(public)` | Parent-facing public pages: homepage, listings, detail pages, AI, compare, static pages. |
| `frontend/app/auth` | Login, registration, and OTP verification screens. |
| `frontend/app/dashboard` | Parent dashboard shell. |
| `frontend/app/school/dashboard` | School dashboard shell. |
| `frontend/app/admin` | Admin dashboard shell and section route. |
| `frontend/components/schools` | School cards, listing filters, and detail inquiry CTA. |
| `frontend/components/ai/ai-chat.tsx` | AI recommendation chat UI and POST request to `/api/ai/recommend`. |
| `frontend/components/inquiry/inquiry-form.tsx` | Client-side inquiry form with Zod and React Hook Form validation. |
| `frontend/components/ui` | Shared button, badge, and card primitives. |
| `frontend/components/providers.tsx` | TanStack Query provider. |
| `frontend/data/schools.ts` | Local mock school data for static rendering and fallback UI. |
| `frontend/lib/api.ts` | Frontend school API helper with mock fallback. |
| `frontend/store/compare-store.ts` | Zustand compare shortlist state. |

### File-by-file monorepo notes

| File | What a new developer should know |
| --- | --- |
| `README.md` | Project-level documentation for product context, architecture, setup, API map, and deployment. |
| `package.json` | Root workspace manifest; coordinates frontend and backend scripts. |
| `package-lock.json` | Locks all workspace package versions for reproducible installs. |
| `backend/Backend.md` | Backend-specific onboarding guide. |
| `backend/package.json` | Backend scripts and dependencies. |
| `backend/tsconfig.json` | Backend TypeScript compiler configuration. |
| `backend/eslint.config.mjs` | Backend ESLint flat configuration. |
| `backend/src/app.ts` | Express application factory and middleware/route composition. |
| `backend/src/server.ts` | API process entrypoint and port binding. |
| `backend/src/config/env.ts` | Backend environment variable schema and defaults. |
| `backend/src/config/prisma.ts` | Shared Prisma client. |
| `backend/src/controllers/admin.controller.ts` | Admin school and moderation endpoints; mostly stubbed today. |
| `backend/src/controllers/ai.controller.ts` | Validates recommendation preferences and calls the AI service. |
| `backend/src/controllers/auth.controller.ts` | OTP send/verify, user upsert, and JWT issuance. |
| `backend/src/controllers/inquiries.controller.ts` | Admission inquiry creation, status updates, and inquiry notes. |
| `backend/src/controllers/media.controller.ts` | Cloudinary upload/delete HTTP handlers. |
| `backend/src/controllers/payments.controller.ts` | Razorpay order, payment verification, and webhook handlers. |
| `backend/src/controllers/schools.controller.ts` | School listing/detail plus registration/update moderation-shaped handlers. |
| `backend/src/controllers/taxonomy.controller.ts` | City, state, and board list endpoints with approved-school counts. |
| `backend/src/data/mock-schools.ts` | Prisma-backed school query helper despite the historical mock filename. |
| `backend/src/middleware/auth.ts` | JWT bearer auth and role checks. |
| `backend/src/middleware/error-handler.ts` | Central JSON error formatter. |
| `backend/src/middleware/security.ts` | Helmet, CORS, API rate limit, and OTP rate limit. |
| `backend/src/prisma/schema.prisma` | PostgreSQL schema for all product domains. |
| `backend/src/prisma/seed.ts` | Seed data for Uttar Pradesh, cities, boards, facilities, and sample schools. |
| `backend/src/routes/admin.routes.ts` | Admin route definitions and admin-only guard. |
| `backend/src/routes/ai.routes.ts` | AI recommendation route definition. |
| `backend/src/routes/auth.routes.ts` | OTP and Google placeholder route definitions. |
| `backend/src/routes/index.ts` | Root API router mounted under `/api`. |
| `backend/src/routes/inquiries.routes.ts` | Inquiry route definitions and role guards. |
| `backend/src/routes/media.routes.ts` | Upload route definitions and role guards. |
| `backend/src/routes/payments.routes.ts` | Razorpay route definitions and guards. |
| `backend/src/routes/schools.routes.ts` | School route definitions and guards. |
| `backend/src/routes/search.routes.ts` | Search alias for school listing. |
| `backend/src/routes/taxonomy.routes.ts` | City/state/board taxonomy routes. |
| `backend/src/services/ai.service.ts` | OpenAI recommendation wrapper and mock fallback. |
| `backend/src/services/cloudinary.service.ts` | Cloudinary media wrapper and skipped fallback. |
| `backend/src/services/razorpay.service.ts` | Razorpay order wrapper and skipped fallback. |
| `backend/src/services/resend.service.ts` | Resend email wrapper and skipped fallback. |
| `backend/src/services/twilio.service.ts` | Twilio SMS/WhatsApp wrapper and skipped fallback. |
| `backend/src/utils/async-handler.ts` | Async controller wrapper for Express error flow. |
| `backend/src/utils/http-error.ts` | Expected API error class with status code. |
| `frontend/Frontend.md` | Frontend-specific onboarding guide. |
| `frontend/package.json` | Frontend scripts and dependencies. |
| `frontend/tsconfig.json` | Frontend TypeScript configuration and alias setup. |
| `frontend/tsconfig.tsbuildinfo` | Incremental TypeScript cache. |
| `frontend/next.config.ts` | Next image host and Turbopack monorepo root config. |
| `frontend/next-env.d.ts` | Next TypeScript declarations. |
| `frontend/postcss.config.mjs` | Tailwind/PostCSS configuration. |
| `frontend/eslint.config.mjs` | Frontend ESLint flat configuration. |
| `frontend/public/school-logo.svg` | Default school logo asset. |
| `frontend/data/schools.ts` | Mock school data, target cities, boards, facilities, and `School` type. |
| `frontend/lib/api.ts` | School API helper with mock fallback. |
| `frontend/lib/utils.ts` | Class merge helper and INR formatter. |
| `frontend/store/compare-store.ts` | Compare shortlist Zustand store. |
| `frontend/components/ai/ai-chat.tsx` | AI recommendation chat and response cards. |
| `frontend/components/inquiry/inquiry-form.tsx` | Admission inquiry form with Zod validation. |
| `frontend/components/schools/school-card.tsx` | Reusable school listing/detail card. |
| `frontend/components/schools/school-inquiry-cta.tsx` | Client CTA that opens the inquiry form on detail pages. |
| `frontend/components/schools/search-panel.tsx` | Search/filter form that pushes `/schools` query params. |
| `frontend/components/ui/badge.tsx` | Badge primitive and tone variants. |
| `frontend/components/ui/button.tsx` | Button primitive and action variants. |
| `frontend/components/ui/card.tsx` | Card primitive used for repeated content and sections. |
| `frontend/components/providers.tsx` | TanStack Query provider wrapper. |
| `frontend/components/site-footer.tsx` | Footer links and target city links. |
| `frontend/components/site-header.tsx` | Sticky public navigation and login CTA. |
| `frontend/app/globals.css` | Tailwind import, design tokens, global styles, and container width. |
| `frontend/app/layout.tsx` | Root layout with fonts, metadata, providers, header, and footer. |
| `frontend/app/admin/page.tsx` | Admin dashboard landing shell. |
| `frontend/app/admin/[section]/page.tsx` | Dynamic admin section shell. |
| `frontend/app/auth/login/page.tsx` | Login page shell. |
| `frontend/app/auth/register/page.tsx` | Registration page shell. |
| `frontend/app/auth/verify-otp/page.tsx` | OTP verification page shell. |
| `frontend/app/dashboard/page.tsx` | Parent dashboard shell. |
| `frontend/app/school/dashboard/page.tsx` | School dashboard shell. |
| `frontend/app/(public)/page.tsx` | Public homepage. |
| `frontend/app/(public)/about/page.tsx` | About page. |
| `frontend/app/(public)/ai-recommend/page.tsx` | AI recommendation page wrapper. |
| `frontend/app/(public)/blog/page.tsx` | Blog/SEO content shell. |
| `frontend/app/(public)/compare/page.tsx` | Compare page. |
| `frontend/app/(public)/contact/page.tsx` | Contact page. |
| `frontend/app/(public)/for-schools/page.tsx` | School onboarding page. |
| `frontend/app/(public)/privacy-policy/page.tsx` | Privacy policy page. |
| `frontend/app/(public)/terms-of-service/page.tsx` | Terms page. |
| `frontend/app/(public)/schools/page.tsx` | `/schools` server wrapper and suspense shell. |
| `frontend/app/(public)/schools/schools-listing-client.tsx` | Client listing implementation with TanStack Query. |
| `frontend/app/(public)/schools/[slug]/page.tsx` | Dual school detail/city page route. |
| `frontend/app/(public)/schools/board/[board]/page.tsx` | Board SEO route. |
| `frontend/app/(public)/schools/category/[category]/page.tsx` | Category SEO route. |
| `frontend/app/(public)/schools/state/[state]/page.tsx` | State SEO route. |

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd "New project"
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

Provider keys are optional for local development. When omitted, services either return skipped responses or deterministic mock responses where implemented.

### 3. Validate Prisma schema

```bash
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/schoolsetu'; npx prisma validate --schema backend/src/prisma/schema.prisma
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

- Frontend: `npm run dev --workspace frontend`
- Backend: `npm run dev --workspace backend`

### 6. Build and typecheck

```bash
npm run typecheck
npm run build
```

Note: `frontend/package.json` currently uses `next lint`, which is not valid in this Next.js 16 setup. Use this until the script is updated:

```bash
npm exec --workspace frontend eslint .
```

## Environment Variables

### Frontend

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Recommended | `frontend/lib/api.ts`, listings, detail page, AI chat | Base URL for the backend, for example `http://localhost:4000`. When absent, some school UI falls back to local mock data; AI chat posts to relative `/api/ai/recommend` and will show an error unless proxied. |
| `NEXTAUTH_URL` | Pending | Auth.js integration | Needed when Google OAuth is fully wired through NextAuth/Auth.js. Not currently consumed by committed code. |
| `NEXTAUTH_SECRET` | Pending | Auth.js integration | Secret for Auth.js session signing. Not currently consumed by committed code. |
| `GOOGLE_CLIENT_ID` | Pending | Auth.js integration | Google OAuth client id. Not currently consumed by committed code. |
| `GOOGLE_CLIENT_SECRET` | Pending | Auth.js integration | Google OAuth secret. Not currently consumed by committed code. |

### Backend

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `backend/src/config/env.ts` | Runtime mode. Defaults to `development`. |
| `PORT` | No | `backend/src/server.ts` | API port. Defaults to `4000`. |
| `FRONTEND_URL` | No | CORS middleware | Allowed frontend origin. Defaults to `http://localhost:3000`. |
| `DATABASE_URL` | Required for Prisma queries | Prisma | PostgreSQL connection string. Optional in env validation, but Prisma-backed endpoints need it. |
| `JWT_SECRET` | Required in production | Auth middleware and OTP verify | Signs 7-day JWTs. Defaults to `development-secret`, which must not be used in production. |
| `OPENAI_API_KEY` | Optional | AI service | Enables OpenAI recommendations. Missing key returns `{ provider: "mock", recommendations: mockSchools.slice(0, 3) }`. Current backend `mockSchools` export is empty until populated or replaced. |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio service | Twilio account identifier for SMS and WhatsApp. |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio service | Twilio auth token. |
| `TWILIO_PHONE_NUMBER` | Optional | Twilio SMS OTP | SMS sender number. Missing credentials return `{ skipped: true, reason: "Twilio SMS credentials not configured" }`. |
| `TWILIO_WHATSAPP_NUMBER` | Optional | Twilio WhatsApp | WhatsApp sender number. Missing credentials return skipped response. |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary service | Cloudinary account name. Missing credentials return skipped response for upload/delete. |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary service | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary service | Cloudinary secret. |
| `RESEND_API_KEY` | Optional | Resend service | Enables inquiry confirmation emails. Missing key returns skipped response. |
| `RAZORPAY_KEY_ID` | Optional | Razorpay service | Enables order creation. Missing keys return skipped response. |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay verify | Used for payment signature verification. |
| `RAZORPAY_WEBHOOK_SECRET` | Pending | Webhook hardening | Declared but webhook verification is not implemented yet. |

## Workspace Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `npm run dev` | `npm-run-all --parallel dev:frontend dev:backend` | Runs both apps concurrently. |
| `npm run dev:frontend` | `npm run dev --workspace frontend` | Starts Next.js dev server. |
| `npm run dev:backend` | `npm run dev --workspace backend` | Starts Express with `tsx watch`. |
| `npm run build` | Frontend build then backend build | Produces `.next` and `backend/dist`. |
| `npm run lint` | Frontend lint then backend lint | Intended lint command. Frontend script needs updating for Next 16. |
| `npm run typecheck` | Frontend typecheck then backend typecheck | Runs `tsc --noEmit` in both workspaces. |

## Feature Coverage

### Implemented

- Public homepage with search entry points and city links.
- `/schools` listing page with search, city filter, board filter, pagination, skeleton, empty state, API fetch, and mock fallback.
- `/schools/[slug]` dual route: checks city slug first, otherwise renders school detail.
- School detail hero, overview, academics, fees, facilities, gallery, inquiry CTA, and JSON-LD `School` schema.
- City listing pages using `SchoolCard`.
- Board, category, and state SEO route shells.
- AI recommendation page and chat UI posting to `/api/ai/recommend`.
- Compare store with up to three selected schools.
- OTP send and verify backend with persisted `OtpRecord` and 7-day JWT.
- Prisma schema for the intended production domain.
- Taxonomy endpoints for cities, states, and boards.
- Inquiry create/status/note endpoints with auth and duplicate prevention.
- Provider wrappers for Twilio, Resend, Cloudinary, Razorpay, and OpenAI.

### Partially implemented

- School registration and update endpoints return moderation-shaped responses but do not yet persist full submitted payloads into all Prisma tables.
- Admin endpoints are route-protected but many controller actions are stubs.
- Media upload accepts `filePath` instead of multipart uploads.
- Razorpay webhook returns `{ received: true }` but does not verify event signatures or persist payment state.
- AI fallback references `mockSchools`, which is currently empty in the backend Prisma helper file.
- Frontend inquiry form validates locally and logs submission; it is not yet wired to the authenticated inquiry API.

### Pending

- Complete Auth.js Google OAuth integration.
- School claim flow and school profile editing UI.
- Admin moderation UI connected to `PendingUpdate` and `ApprovalLog`.
- Production migrations and hosted database workflow.
- File upload middleware and Cloudinary upload from browser forms.
- Payment persistence, webhook verification, and featured listing activation.
- Request logging, observability, and tests.
- Spam detection and lead quality scoring.

## Architecture Decisions

### Why Next.js App Router

SchoolSetu depends on SEO. Parents search for phrases such as "CBSE schools in Prayagraj" or "boarding schools in Jhansi". The App Router gives the frontend server components, static generation, dynamic metadata, route groups, and easy city/board/category SEO pages. It also lets interactive pieces such as compare and chat stay as client components.

### Why PostgreSQL over MongoDB

The domain is relational: schools belong to cities, states, and boards; inquiries connect parents and schools; featured listings connect payments and schools; moderation logs connect admins and pending updates. PostgreSQL enforces this structure cleanly and Prisma provides typed access to it.

### Why modular monolith

The product is early-stage but domain-heavy. A modular monolith keeps deployment simple while preserving boundaries through controllers, routes, services, middleware, and Prisma models. It avoids premature microservices while making later extraction possible.

### Why TypeScript end-to-end

School data is reused across listing cards, detail pages, AI recommendations, inquiry flows, and backend responses. TypeScript reduces shape drift, catches route/controller mistakes, and keeps frontend normalization safer while the backend evolves.

## API Overview

| Method | Route | Auth required | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Health check returning service status. |
| `POST` | `/api/auth/send-otp` | No | Sends and stores a 6-digit OTP for a phone number. Rate limited. |
| `POST` | `/api/auth/verify-otp` | No | Verifies OTP, creates or updates parent user, returns JWT. |
| `POST` | `/api/auth/google` | No | Placeholder response; Google OAuth is handled by frontend Auth.js later. |
| `GET` | `/api/schools` | No | Lists approved schools with query, city, board, facility, category, page, and limit filters. |
| `GET` | `/api/schools/:slug` | No | Returns one approved school by slug. |
| `POST` | `/api/schools` | `school` or `admin` | Submits a school registration for moderation. Currently returns shaped response. |
| `PUT` | `/api/schools/:id` | `school` or `admin` | Submits a school update to moderation. Currently returns shaped response. |
| `GET` | `/api/schools/:id/inquiries` | `school` or `admin` | Returns inquiries for a school. Currently stubbed empty. |
| `GET` | `/api/search` | No | Alias for school listing search. |
| `POST` | `/api/inquiries` | `parent` | Creates an admission inquiry and optionally sends confirmation email. |
| `PUT` | `/api/inquiries/:id/status` | `school` or `admin` | Updates inquiry status. |
| `POST` | `/api/inquiries/:id/notes` | `school` or `admin` | Adds a note to an inquiry. |
| `POST` | `/api/ai/recommend` | No | Sends preferences to AI recommendation service. |
| `GET` | `/api/admin/schools` | `admin` | Lists schools for admin review. Currently uses stub data. |
| `PUT` | `/api/admin/schools/:id/approve` | `admin` | Approves a school. Currently stubbed. |
| `PUT` | `/api/admin/schools/:id/reject` | `admin` | Rejects a school. Currently stubbed. |
| `GET` | `/api/admin/moderation` | `admin` | Lists pending moderation items. Currently empty. |
| `PUT` | `/api/admin/moderation/:id/approve` | `admin` | Approves pending update. Currently stubbed. |
| `PUT` | `/api/admin/moderation/:id/reject` | `admin` | Rejects pending update. Currently stubbed. |
| `POST` | `/api/upload/image` | `school` or `admin` | Uploads image via Cloudinary using a file path payload. |
| `DELETE` | `/api/upload/image/:id` | `school` or `admin` | Deletes a Cloudinary asset by public id. |
| `POST` | `/api/payments/create-order` | `school` or `admin` | Creates Razorpay order for featured listing payments. |
| `POST` | `/api/payments/verify-payment` | `school` or `admin` | Verifies Razorpay signature. |
| `POST` | `/api/payments/webhook` | No | Razorpay webhook placeholder. |
| `GET` | `/api/cities` | No | Lists cities with approved school counts. |
| `GET` | `/api/states` | No | Lists states with cities that have approved schools. |
| `GET` | `/api/boards` | No | Lists boards with approved school counts. |

## Authentication Flow

### OTP flow

1. Frontend collects a phone number.
2. Frontend calls `POST /api/auth/send-otp` with `{ "phone": "..." }`.
3. `backend/src/controllers/auth.controller.ts` generates a 6-digit OTP with `randomInt`.
4. Existing unused OTP records for the phone are marked used.
5. A new `OtpRecord` is created with a 5-minute expiry.
6. `twilioService.sendSmsOtp(phone, otp)` sends the SMS, or returns a skipped response if Twilio is not configured.
7. User submits `{ phone, otp }` to `POST /api/auth/verify-otp`.
8. Backend finds an unused, unexpired OTP, marks it used, and upserts a parent `User`.
9. Backend signs JWT payload `{ id: user.id, role: user.role }` with `JWT_SECRET`, expiring in 7 days.
10. Frontend stores and sends the token as `Authorization: Bearer <token>` for protected APIs.

### Google OAuth flow

The backend has `POST /api/auth/google`, but it currently returns a message that Google OAuth should be handled by Auth.js on the frontend. Production implementation should configure `next-auth`, create or link a `User` with `googleId`, and issue or bridge a backend JWT if backend-protected APIs continue to use bearer tokens.

### JWT lifecycle

- Issued from OTP verification.
- Payload shape is `{ id: string, role: "parent" | "school" | "admin" }`.
- Expiry is `7d`.
- `requireAuth` reads `Authorization: Bearer <token>` and verifies with `env.JWT_SECRET`.
- `requireRole` checks `request.user.role` against allowed roles.

## Database Overview

| Model | Purpose |
| --- | --- |
| `User` | Parents, schools, and admins. Stores email, phone, role, optional Google id, and relations to inquiries and moderation actions. |
| `OtpRecord` | OTP codes, expiry, used flag, and indexes for phone and expiry lookup. |
| `State` | State taxonomy, currently Uttar Pradesh in seed data. |
| `City` | City taxonomy with slug and `hasSchools`; related to state and schools. |
| `Board` | Education boards such as CBSE, ICSE, UP Board. |
| `School` | Core listing record with city, board, status, type, medium, featured flag, and child profile tables. |
| `SchoolDetails` | Principal, year, affiliation, website, email, phone, WhatsApp. |
| `SchoolAddress` | Address, pincode, coordinates, and maps URL. |
| `SchoolAcademics` | Streams, class range, admission window, required documents, and age criteria. |
| `SchoolFees` | Admission, tuition, transport, hostel, exam fees, and update timestamp. |
| `SchoolFacilities` | Boolean facility flags used for filters and profile display. |
| `SchoolGallery` | Cloudinary image/video URLs, captions, and ordering. |
| `SchoolSection` | Flexible content sections for sports, hostel, IIT/NEET, etc. |
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

## Service Integrations

| Service | File | Project role | Dev fallback |
| --- | --- | --- | --- |
| Twilio | `backend/src/services/twilio.service.ts` | Sends SMS OTP and WhatsApp messages. | Returns `{ skipped: true, reason, phone, otp }` when credentials are missing. |
| Cloudinary | `backend/src/services/cloudinary.service.ts` | Uploads/deletes school gallery and profile media. | Returns skipped response when credentials are missing. |
| OpenAI | `backend/src/services/ai.service.ts` | Generates school recommendations from parent preferences and available schools. | Returns provider `mock` and `mockSchools.slice(0, 3)` when `OPENAI_API_KEY` is missing. |
| Resend | `backend/src/services/resend.service.ts` | Sends inquiry confirmation emails. | Returns skipped response when `RESEND_API_KEY` is missing. |
| Razorpay | `backend/src/services/razorpay.service.ts` | Creates payment orders for featured listings. | Returns skipped response when keys are missing. |

## SEO Strategy

- Next.js App Router is used for route-level metadata and static generation.
- `frontend/app/(public)/schools/[slug]/page.tsx` implements `generateMetadata()` for both city pages and school pages.
- School detail pages render JSON-LD `School` schema with name, address, phone, image, URL, and description.
- City pages use `/schools/[slug]` because Next.js cannot have sibling dynamic routes such as `/schools/[slug]` and `/schools/[city-slug]`.
- Board pages live at `/schools/board/[board]`.
- Category pages live at `/schools/category/[category]`.
- State pages live at `/schools/state/[state]`.
- Future work should add custom OG images, canonical URLs, sitemap generation, ISR intervals, and `SeoPage` database-backed copy.

## Deployment Notes

Recommended deployment split:

| Component | Recommended host | Notes |
| --- | --- | --- |
| Frontend | Vercel | Best fit for Next.js App Router, SSG, SSR, and edge caching. Set `NEXT_PUBLIC_API_URL` to the backend URL. |
| Backend | Railway or Render | Run `npm run build --workspace backend` and `npm run start --workspace backend`. Configure provider keys and `DATABASE_URL`. |
| Database | Neon PostgreSQL | Serverless PostgreSQL works well for Prisma and early-stage traffic. |
| Media | Cloudinary | Store school images and galleries. |
| Email/SMS/Payments | Resend, Twilio, Razorpay | Use production keys only in backend environment. |

Before production:

- Replace development secrets.
- Run Prisma migrations against the hosted database.
- Seed boards, states, cities, and initial schools.
- Enable proper CORS origin.
- Add request logging and monitoring.
- Verify Razorpay webhooks.
- Connect frontend inquiry form to authenticated inquiry API.

## Contributing and Development Guidelines

- Keep the project TypeScript-first. Do not introduce untyped API shapes when Zod or Prisma types can describe them.
- Prefer existing design tokens: primary blue `#185FA5`, amber CTA `#EF9F27`, background `#F1EFE8`, text `#2C2C2A`, border `#D3D1C7`.
- Do not mix admin features into parent-facing pages unless the route is explicitly an admin route.
- Keep frontend server data and client interactivity separated: server routes for SEO, client components for chat, compare, forms, and filters.
- Backend controllers should validate input with Zod and delegate provider logic to services.
- Protected APIs must use `requireAuth` and `requireRole`.
- Be honest about fallbacks: skipped provider responses are acceptable locally, but production should use real credentials.
- Run these before handing off:

```bash
npm run typecheck
npm run build
npm exec --workspace frontend eslint .
```

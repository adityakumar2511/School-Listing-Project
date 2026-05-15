# SchoolSetu Backend Documentation

This document explains the SchoolSetu backend: its purpose, architecture, files, API behavior, Prisma schema, authentication, service integrations, security model, and production checklist.

## Purpose

The backend is the API layer for SchoolSetu, a school discovery and admission platform for Tier-2 and Tier-3 Indian cities. It owns authentication, school data, taxonomy, inquiries, moderation, media upload integration, AI recommendations, payments, and provider wrappers.

The project is designed as a **modular monolith**:

- One Express app.
- Clear domain routers.
- Controllers for HTTP behavior.
- Services for external providers.
- Prisma for database access.
- Middleware for security, auth, rate limiting, and error formatting.

This shape keeps deployment simple while preserving domain boundaries that can later be extracted if traffic or team size requires it.

## Tech Stack Deep Dive

| Package | Current version range | Why it was chosen |
| --- | --- | --- |
| `express` | `^5.1.0` | Simple, mature HTTP API framework. Express is easier for onboarding than Fastify and enough for the current modular monolith. |
| `typescript` | `^5.9.3` | Type safety across controllers, middleware, services, and Prisma. |
| `tsx` | `^4.20.6` | Runs TypeScript directly in development with watch mode. |
| `prisma` / `@prisma/client` | `^6.19.0` | Typed database schema, migrations, generated client, and relational query ergonomics. Chosen over raw SQL to reduce repetitive query code. |
| `postgresql` | Prisma datasource | Relational model fits schools, cities, boards, inquiries, payments, and moderation logs better than MongoDB. |
| `zod` | `^4.1.12` | Runtime request validation with readable schemas. |
| `jsonwebtoken` | `^9.0.2` | Stateless bearer-token auth for parent, school, and admin roles. Chosen over server sessions for API simplicity. |
| `helmet` | `^8.1.0` | Secure HTTP headers by default. |
| `express-rate-limit` | `^8.2.1` | Global throttling and stricter OTP throttling. |
| `cors` | `^2.8.5` | Restricts browser API access to `FRONTEND_URL`. |
| `morgan` | `^1.10.1` | Development request logging. |
| `bcryptjs` | `^3.0.3` | Installed for future password or credential flows; not currently used. |
| `openai` | `^6.8.1` | AI school recommendations. |
| `twilio` | `^5.10.4` | SMS OTP and WhatsApp messaging. |
| `resend` | `^6.4.0` | Inquiry confirmation email. |
| `cloudinary` | `^2.8.0` | School images and gallery uploads. |
| `razorpay` | `^2.9.6` | Featured listing payments. |
| `pino`, `winston` | Installed | Future structured logging. Current app uses `morgan` and `console.error`. |

## Complete File Structure

```text
backend/
|-- Backend.md
|-- package.json
|-- tsconfig.json
|-- eslint.config.mjs
|-- src/
    |-- app.ts
    |-- server.ts
    |-- config/
    |   |-- env.ts
    |   |-- prisma.ts
    |-- controllers/
    |   |-- admin.controller.ts
    |   |-- ai.controller.ts
    |   |-- auth.controller.ts
    |   |-- inquiries.controller.ts
    |   |-- media.controller.ts
    |   |-- payments.controller.ts
    |   |-- schools.controller.ts
    |   |-- taxonomy.controller.ts
    |-- data/
    |   |-- mock-schools.ts
    |-- middleware/
    |   |-- auth.ts
    |   |-- error-handler.ts
    |   |-- security.ts
    |-- prisma/
    |   |-- schema.prisma
    |   |-- seed.ts
    |-- routes/
    |   |-- admin.routes.ts
    |   |-- ai.routes.ts
    |   |-- auth.routes.ts
    |   |-- index.ts
    |   |-- inquiries.routes.ts
    |   |-- media.routes.ts
    |   |-- payments.routes.ts
    |   |-- schools.routes.ts
    |   |-- search.routes.ts
    |   |-- taxonomy.routes.ts
    |-- services/
    |   |-- ai.service.ts
    |   |-- cloudinary.service.ts
    |   |-- razorpay.service.ts
    |   |-- resend.service.ts
    |   |-- twilio.service.ts
    |-- utils/
        |-- async-handler.ts
        |-- http-error.ts
```

### Root backend files

| File | Explanation |
| --- | --- |
| `backend/package.json` | Defines backend scripts and dependencies. Important scripts: `dev`, `build`, `start`, `typecheck`, `seed`, `prisma:generate`, `prisma:migrate`. |
| `backend/tsconfig.json` | TypeScript compiler settings for ESM output to `dist`. |
| `backend/eslint.config.mjs` | ESLint flat config for TypeScript source. |

### App entry files

| File | Explanation |
| --- | --- |
| `src/app.ts` | Creates the Express app. Installs Helmet, CORS, API rate limit, JSON body parser, Morgan logger, `/api` routes, and final error handler. |
| `src/server.ts` | Imports `createApp()`, reads `env.PORT`, starts listening, and logs the local API URL. |

### Config

| File | Explanation |
| --- | --- |
| `src/config/env.ts` | Loads `dotenv/config`, validates environment variables with Zod, sets local defaults for `NODE_ENV`, `PORT`, `FRONTEND_URL`, and `JWT_SECRET`. |
| `src/config/prisma.ts` | Exports a Prisma client singleton. All database-backed controllers and data helpers import this. |

### Controllers

| File | Endpoints handled |
| --- | --- |
| `src/controllers/auth.controller.ts` | `sendOtp`, `verifyOtp`. Generates OTP, stores `OtpRecord`, sends Twilio SMS, verifies OTP, upserts parent user, signs JWT. |
| `src/controllers/schools.controller.ts` | School listing, detail lookup, registration submission, update submission, and school inquiries stub. |
| `src/controllers/inquiries.controller.ts` | Create admission inquiry, update inquiry status, add inquiry notes. Includes duplicate inquiry prevention. |
| `src/controllers/ai.controller.ts` | Validates preferences and delegates recommendations to `aiService`. |
| `src/controllers/admin.controller.ts` | Admin school list and moderation approve/reject endpoints. Currently mostly stubbed. |
| `src/controllers/media.controller.ts` | Cloudinary upload/delete wrapper endpoints. |
| `src/controllers/payments.controller.ts` | Razorpay order creation, payment signature verification, webhook placeholder. |
| `src/controllers/taxonomy.controller.ts` | Lists cities, states, and boards with approved-school counts. |

### Routes

| File | What it mounts |
| --- | --- |
| `src/routes/index.ts` | Root `/api` router. Mounts health, auth, schools, inquiries, AI, admin, upload, payments, search, and taxonomy routes. |
| `src/routes/auth.routes.ts` | `/auth/send-otp`, `/auth/verify-otp`, `/auth/google`. |
| `src/routes/schools.routes.ts` | `/schools` listing/detail/create/update/school inquiries. |
| `src/routes/inquiries.routes.ts` | `/inquiries` create/status/notes. |
| `src/routes/ai.routes.ts` | `/ai/recommend`. |
| `src/routes/admin.routes.ts` | `/admin/*`, protected by `requireAuth` and `requireRole("admin")`. |
| `src/routes/media.routes.ts` | `/upload/image`, protected for `school` and `admin`. |
| `src/routes/payments.routes.ts` | `/payments/create-order`, `/payments/verify-payment`, `/payments/webhook`. |
| `src/routes/search.routes.ts` | `/search`, alias for school listing. |
| `src/routes/taxonomy.routes.ts` | `/cities`, `/states`, `/boards`. |

### Services

| File | Explanation |
| --- | --- |
| `src/services/ai.service.ts` | Wraps OpenAI. Uses a system prompt for Indian school recommendations and returns JSON. Missing key returns provider `mock`. |
| `src/services/cloudinary.service.ts` | Configures Cloudinary when credentials exist. Uploads file paths and deletes assets. Missing credentials return skipped responses. |
| `src/services/razorpay.service.ts` | Creates Razorpay orders when keys exist. Missing keys return skipped response. |
| `src/services/resend.service.ts` | Sends emails from `SchoolSetu <noreply@schoolsetu.example>`. Missing key returns skipped response. |
| `src/services/twilio.service.ts` | Sends SMS OTP and WhatsApp messages. Missing credentials return skipped responses. |

### Middleware

| File | Explanation |
| --- | --- |
| `src/middleware/auth.ts` | Defines `AuthRole`, augments `Express.Request.user`, implements `requireAuth` and `requireRole`. |
| `src/middleware/error-handler.ts` | Converts `HttpError` into `{ error }` with status code and unexpected errors into 500 responses. |
| `src/middleware/security.ts` | Exports Helmet, CORS, global API rate limit, and OTP-specific rate limit. |

### Utilities

| File | Explanation |
| --- | --- |
| `src/utils/async-handler.ts` | Wraps async controllers and forwards rejected promises to Express error middleware. This avoids repeated try/catch blocks. |
| `src/utils/http-error.ts` | Small error class with `statusCode` and message. Used for expected API errors. |

### Data and Prisma

| File | Explanation |
| --- | --- |
| `src/data/mock-schools.ts` | Historical filename. Now contains Prisma query helpers: `schoolInclude`, `buildSchoolWhere`, `findSchools`, `findSchoolBySlug`, plus an empty `mockSchools` export used by older stubs. |
| `src/prisma/schema.prisma` | Complete relational schema for users, schools, taxonomy, inquiries, moderation, payments, blog, and SEO pages. |
| `src/prisma/seed.ts` | Seeds Uttar Pradesh, target cities, boards, facilities, and sample Prayagraj schools. |

## API Reference

Base path: `/api`

Error format:

```json
{ "error": "Message here" }
```

### Health

#### `GET /api/health`

Auth: none

Response:

```json
{ "status": "ok", "service": "schoolsetu-api" }
```

### Auth

#### `POST /api/auth/send-otp`

Auth: none  
Rate limit: 5 requests per 10 minutes per rate-limit key

Request body:

```ts
{ phone: string }
```

Example:

```json
{ "phone": "+919876543210" }
```

Response:

```json
{ "success": true }
```

Errors:

- `400` for invalid body from Zod.
- `429` when OTP rate limit is exceeded.
- `500` for unexpected Twilio/database failures.

Notes:

- OTP expires in 5 minutes.
- Existing unused OTPs for the phone are marked used.
- If Twilio credentials are missing, `twilioService` returns a skipped response but the controller still returns success.

#### `POST /api/auth/verify-otp`

Auth: none

Request body:

```ts
{
  phone: string;
  otp: string; // six digits
}
```

Example:

```json
{ "phone": "+919876543210", "otp": "123456" }
```

Response:

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "clx...",
    "phone": "+919876543210",
    "role": "parent"
  }
}
```

Errors:

- `401` for invalid, expired, or already-used OTP.
- `400` for invalid phone or OTP shape.

#### `POST /api/auth/google`

Auth: none

Response:

```json
{ "message": "Google OAuth callback is handled by Auth.js on the frontend." }
```

Current status: placeholder. Production should link Auth.js users to `User.googleId`.

### Schools

#### `GET /api/schools`

Auth: none

Query params:

```ts
{
  q?: string;
  city?: string;
  board?: string;
  facility?: string;
  category?: string;
  page?: number;  // default 1
  limit?: number; // default 12, max 50
}
```

Example:

```http
GET /api/schools?q=cbse&city=prayagraj&board=cbse&facility=transport&page=1&limit=6
```

Response:

```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Sangam Valley International School",
      "slug": "sangam-valley-international-school",
      "status": "approved",
      "city": { "name": "Prayagraj", "slug": "prayagraj" },
      "board": { "name": "CBSE", "slug": "cbse" },
      "details": {},
      "address": {},
      "academics": {},
      "fees": {},
      "facilities": {},
      "gallery": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 1,
    "totalPages": 1
  }
}
```

Errors:

- `400` for invalid `page` or `limit`.
- `500` when Prisma/database is unavailable.

#### `GET /api/schools/:slug`

Auth: none

Response:

```json
{ "data": { "id": "clx...", "name": "Sangam Valley International School", "slug": "sangam-valley-international-school" } }
```

Errors:

- `404` if no approved school matches the slug.

#### `POST /api/schools`

Auth: `school` or `admin`

Request body:

```ts
Record<string, unknown>
```

Current response:

```json
{
  "message": "School registration submitted for moderation",
  "data": {
    "name": "New School",
    "status": "pending"
  }
}
```

Current status: shape only. Production should validate body and persist `School`, profile tables, and `PendingUpdate` or approval state.

#### `PUT /api/schools/:id`

Auth: `school` or `admin`

Current response:

```json
{
  "message": "Update submitted to moderation queue",
  "pendingUpdate": {
    "schoolId": "school-id",
    "newValue": {},
    "status": "pending"
  }
}
```

Current status: shape only. Production should persist `PendingUpdate`.

#### `GET /api/schools/:id/inquiries`

Auth: `school` or `admin`

Current response:

```json
{ "data": [], "schoolId": "school-id" }
```

Current status: stub. Production should query inquiries scoped to the school/admin.

### Search

#### `GET /api/search`

Auth: none

Alias for `GET /api/schools`. Supports the same query params and response shape.

### Inquiries

#### `POST /api/inquiries`

Auth: `parent`

Request body:

```ts
{
  schoolId: string;
  parentName: string;
  phone: string;
  email?: string;
  message?: string;
  childName?: string;
  grade?: string;
}
```

Example:

```json
{
  "schoolId": "clx_school",
  "parentName": "Ritu Sharma",
  "phone": "+919876543210",
  "email": "ritu@example.com",
  "childName": "Aarav",
  "grade": "Class 8",
  "message": "Need transport and CBSE admission details."
}
```

Response:

```json
{
  "data": {
    "id": "clx_inquiry",
    "schoolId": "clx_school",
    "studentName": "Aarav",
    "classApplying": "Class 8",
    "status": "new",
    "school": { "id": "clx_school", "name": "School Name", "slug": "school-name" },
    "parent": { "id": "clx_parent", "name": "Ritu Sharma", "phone": "+919876543210", "email": "ritu@example.com" }
  }
}
```

Errors:

- `403` if the authenticated user is not a parent.
- `404` if `schoolId` does not exist.
- `409` if the parent already submitted an inquiry for the same school in the last 7 days.
- `400` for invalid body.

Side effect:

- If `email` is present, sends confirmation email through `resendService`.

#### `PUT /api/inquiries/:id/status`

Auth: `school` or `admin`

Request body:

```ts
{ status: "CONTACTED" | "ADMITTED" | "REJECTED" }
```

Response:

```json
{ "data": { "id": "clx_inquiry", "status": "contacted" } }
```

Errors:

- `404` if inquiry does not exist.
- `403` if school user does not manage this inquiry.
- `400` for unsupported status.

Note:

- Status input is uppercase and mapped to Prisma lowercase enum values.
- Current school authorization compares `inquiry.schoolId` to `user.id`; production should map school users to school ownership explicitly.

#### `POST /api/inquiries/:id/notes`

Auth: `school` or `admin`

Request body:

```ts
{ note: string }
```

Response:

```json
{
  "data": {
    "id": "clx_note",
    "note": "Called parent, asked for documents.",
    "user": { "id": "clx_user", "name": "Admin", "role": "admin" }
  }
}
```

Errors:

- `404` if inquiry does not exist.
- `403` if user cannot manage inquiry.
- `400` if note is empty.

### AI

#### `POST /api/ai/recommend`

Auth: none

Request body:

```ts
{ preferences: string } // min length 10
```

Example:

```json
{ "preferences": "Class 8, Prayagraj, CBSE, budget 5000, transport needed" }
```

Response:

```json
{
  "data": {
    "provider": "mock",
    "recommendations": [],
    "reasoning": "OpenAI key not configured. Returning deterministic sample recommendations."
  }
}
```

When OpenAI is configured, `ai.service.ts` asks for concise JSON and returns parsed model output.

Errors:

- `400` if preferences are too short.
- `500` if OpenAI returns invalid JSON or the provider request fails.

### Admin

All admin routes require `Authorization: Bearer <admin-jwt>`.

#### `GET /api/admin/schools`

Response:

```json
{ "data": [] }
```

Current status: uses `mockSchools`, currently empty.

#### `PUT /api/admin/schools/:id/approve`

Response:

```json
{ "message": "School approved", "schoolId": "school-id" }
```

Current status: stub.

#### `PUT /api/admin/schools/:id/reject`

Request body:

```ts
{ reason?: string }
```

Response:

```json
{ "message": "School rejected", "schoolId": "school-id", "reason": "Incomplete profile" }
```

Current status: stub.

#### `GET /api/admin/moderation`

Response:

```json
{ "data": [] }
```

Current status: stub.

#### `PUT /api/admin/moderation/:id/approve`

Response:

```json
{ "message": "Pending update approved", "id": "pending-id" }
```

Current status: stub.

#### `PUT /api/admin/moderation/:id/reject`

Request body:

```ts
{ reason?: string }
```

Response:

```json
{ "message": "Pending update rejected", "id": "pending-id", "reason": "Needs proof" }
```

Current status: stub.

### Media

#### `POST /api/upload/image`

Auth: `school` or `admin`

Request body:

```ts
{ filePath: string }
```

Response with credentials:

```json
{ "data": { "secure_url": "https://res.cloudinary.com/...", "public_id": "schoolsetu/..." } }
```

Response without credentials:

```json
{
  "data": {
    "skipped": true,
    "reason": "Cloudinary credentials not configured",
    "filePath": "/tmp/image.jpg"
  }
}
```

Current limitation: no multipart upload middleware. The API expects a server-accessible `filePath`.

#### `DELETE /api/upload/image/:id`

Auth: `school` or `admin`

Response:

```json
{ "data": { "result": "ok" } }
```

Without credentials returns skipped response.

### Payments

#### `POST /api/payments/create-order`

Auth: `school` or `admin`

Request body:

```ts
{ amount: number }
```

Response with credentials:

```json
{ "data": { "id": "order_...", "amount": 50000, "currency": "INR" } }
```

Response without credentials:

```json
{
  "data": {
    "skipped": true,
    "reason": "Razorpay credentials not configured",
    "amount": 50000,
    "receipt": "featured_1710000000000"
  }
}
```

#### `POST /api/payments/verify-payment`

Auth: `school` or `admin`

Request body:

```ts
{
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
```

Response:

```json
{ "message": "Payment verified" }
```

Errors:

- `400` if `RAZORPAY_KEY_SECRET` exists and signature does not match.

#### `POST /api/payments/webhook`

Auth: none

Response:

```json
{ "received": true }
```

Current status: placeholder. Production must verify webhook signature with `RAZORPAY_WEBHOOK_SECRET`.

### Taxonomy

#### `GET /api/cities`

Auth: none

Returns cities with at least one approved school, their state, and approved school count.

#### `GET /api/states`

Auth: none

Returns states that contain cities with approved schools and nested city counts.

#### `GET /api/boards`

Auth: none

Returns boards with approved school counts.

## Prisma Schema Documentation

### Enums

| Enum | Values | Purpose |
| --- | --- | --- |
| `UserRole` | `parent`, `school`, `admin` | Auth and authorization roles. |
| `SchoolStatus` | `pending`, `approved`, `rejected` | Listing moderation state. |
| `InquiryStatus` | `new`, `contacted`, `interested`, `converted`, `closed`, `admitted`, `rejected` | Admission lead lifecycle. |
| `PendingUpdateStatus` | `pending`, `approved`, `rejected` | School update moderation state. |
| `GalleryType` | `photo`, `video` | School gallery media type. |

### Models

#### `User`

Purpose: Stores all actor accounts: parents, schools, and admins.

Fields:

- `id`: cuid primary key.
- `name`: optional display name.
- `email`: optional unique email.
- `phone`: optional unique phone.
- `role`: `UserRole`, default `parent`.
- `googleId`: optional unique Google OAuth id, mapped to `google_id`.
- `createdAt`: creation timestamp.

Relations:

- Parent inquiries through `ParentInquiries`.
- Inquiry notes created by the user.
- Submitted and reviewed pending updates.
- Approval logs created by admin.

Indexes:

- Unique `email`, `phone`, `googleId`.

#### `OtpRecord`

Purpose: Stores OTP codes for phone login.

Fields:

- `id`, `phone`, `otp`, `expiresAt`, `used`, `usedAt`, `createdAt`.

Indexes:

- `[phone, otp, used]` for verification lookup.
- `[expiresAt]` for cleanup jobs.

#### `State`

Purpose: State taxonomy.

Fields:

- `id`, `name`, unique `slug`.

Relations:

- `cities`.

#### `City`

Purpose: City taxonomy and SEO routing.

Fields:

- `id`, `name`, unique `slug`, `hasSchools`, `stateId`.

Relations:

- Belongs to `State`.
- Has many `School`.

#### `Board`

Purpose: Education board taxonomy.

Fields:

- `id`, `name`, unique `slug`.

Relations:

- Has many `School`.

#### `School`

Purpose: Core school listing.

Fields:

- `id`, `name`, unique `slug`, `cityId`, `stateId`, `boardId`, `type`, `medium`, `description`, `status`, `isFeatured`, `createdAt`.

Relations:

- Belongs to `City` and `Board`.
- Has one details, address, academics, fees, facilities.
- Has many gallery items, sections, achievements, inquiries, pending updates, featured listings, payments.

Indexes:

- Unique `slug`.
- Foreign key indexes are handled by the database/Prisma relation fields.

Note:

- `stateId` exists as a scalar field but there is no explicit `State` relation on `School`; city contains the state relation.

#### `SchoolDetails`

Purpose: Contact and identity details.

Fields:

- `schoolId` primary key, `principalName`, `establishedYear`, `affiliationNo`, `website`, `email`, `phone`, `whatsapp`.

Relation:

- One-to-one with `School`.

#### `SchoolAddress`

Purpose: Physical school address and map data.

Fields:

- `schoolId` primary key, `addressLine`, `city`, `state`, `pincode`, `lat`, `lng`, `googleMapsUrl`.

Relation:

- One-to-one with `School`.

#### `SchoolAcademics`

Purpose: Academic and admission details.

Fields:

- `schoolId` primary key, `streams`, `classesFrom`, `classesTo`, `admissionOpen`, `admissionStart`, `admissionEnd`, `documentsRequired`, `ageCriteria`.

Relation:

- One-to-one with `School`.

#### `SchoolFees`

Purpose: Fee display and filtering.

Fields:

- `schoolId` primary key, `admissionFee`, `tuitionFeeMonthly`, `tuitionFeeAnnual`, `transportFee`, `hostelFee`, `examFee`, `lastUpdated`.

Relation:

- One-to-one with `School`.

#### `SchoolFacilities`

Purpose: Searchable facility flags.

Fields:

- `schoolId` primary key.
- Boolean flags: `library`, `labs`, `hostel`, `transport`, `smartClassroom`, `wifi`, `cctv`, `gym`, `swimmingPool`, `playground`, `auditorium`, `cafeteria`.

Relation:

- One-to-one with `School`.

#### `SchoolGallery`

Purpose: Cloudinary-backed media.

Fields:

- `id`, `schoolId`, `type`, `cloudinaryUrl`, `caption`, `order`.

Relation:

- Belongs to `School`.

#### `SchoolSection`

Purpose: Flexible profile content sections such as hostel, sports, IIT/NEET.

Fields:

- `id`, `schoolId`, `title`, `content`, `sectionType`, `order`.

Relation:

- Belongs to `School`.

#### `SchoolAchievement`

Purpose: Awards and accomplishments.

Fields:

- `id`, `schoolId`, `title`, `year`, `description`.

Relation:

- Belongs to `School`.

#### `Facility`

Purpose: Facility taxonomy for filters and UI labels.

Fields:

- `id`, `name`, `icon`, unique `slug`.

#### `Inquiry`

Purpose: Admission lead from parent to school.

Fields:

- `id`, `parentId`, `schoolId`, `studentName`, `classApplying`, `message`, `status`, `createdAt`.

Relations:

- Optional parent user.
- School.
- Notes.

#### `InquiryNote`

Purpose: Operational notes on an inquiry.

Fields:

- `id`, `inquiryId`, `note`, `createdBy`, `createdAt`.

Relations:

- Inquiry.
- User who created the note.

#### `PendingUpdate`

Purpose: Moderated changes to school profile data.

Fields:

- `id`, `schoolId`, `fieldType`, `oldValue`, `newValue`, `submittedBy`, `status`, `reviewedBy`, `reviewedAt`.

Relations:

- School.
- Submitter user.
- Optional reviewer user.
- Approval logs.

#### `ApprovalLog`

Purpose: Audit trail for pending update decisions.

Fields:

- `id`, `pendingUpdateId`, `action`, `note`, `adminId`, `createdAt`.

Relations:

- Pending update.
- Admin user.

#### `FeaturedListing`

Purpose: Paid featured placement window.

Fields:

- `id`, `schoolId`, `startDate`, `endDate`, `planType`, `paymentId`.

Relations:

- School.
- Optional payment.

#### `Payment`

Purpose: Razorpay payment tracking.

Fields:

- `id`, `schoolId`, `razorpayOrderId`, `razorpayPaymentId`, `amount`, `status`, `planType`, `createdAt`.

Relations:

- School.
- Featured listings.

#### `BlogPost`

Purpose: Content marketing and SEO articles.

Fields:

- `id`, `title`, unique `slug`, `content`, `author`, `publishedAt`, `seoTitle`, `seoDescription`.

#### `SeoPage`

Purpose: Custom SEO content for landing pages.

Fields:

- `id`, `pageType`, `entityId`, `customTitle`, `customDescription`, `customContent`.

## Authentication System

### JWT payload shape

```ts
type AuthRole = "parent" | "school" | "admin";

type AuthUser = {
  id: string;
  role: AuthRole;
};
```

JWT signing:

```ts
const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
  expiresIn: "7d"
});
```

### `requireAuth` flow

File: `src/middleware/auth.ts`

1. Reads `request.headers.authorization`.
2. Requires `Bearer ` prefix.
3. If missing, throws `new HttpError(401, "Authentication required")`.
4. Verifies token with `env.JWT_SECRET`.
5. Assigns decoded payload to `request.user`.
6. Calls `next()`.

### `requireRole` flow

1. Accepts allowed roles, for example `requireRole("school", "admin")`.
2. Checks `request.user`.
3. Checks `request.user.role` is included.
4. Throws `403` when role is not allowed.

### OTP flow

Development and production-ready parts:

- OTP is persisted in `OtpRecord`.
- OTP expires after 5 minutes.
- Previous unused OTPs for the same phone are invalidated.
- OTP is marked used inside a transaction.
- JWT is issued after successful verification.

Production work remaining:

- Add OTP cleanup job.
- Hide OTP in skipped Twilio responses outside local development.
- Add device/session tracking if needed.
- Add resend cooldown UI and audit events.

### Google OAuth flow

Current:

- `POST /api/auth/google` returns a placeholder message.
- Frontend has `next-auth` installed but not wired.

Production:

- Configure Auth.js Google provider in frontend.
- Upsert `User` by `googleId` or email.
- Decide whether Auth.js session alone is enough or whether backend JWT should be minted for Express APIs.

## Service Layer

### `ai.service.ts`

Role:

- Recommends schools based on parent preferences.

Prompt structure:

- System: "You recommend Indian schools for parents. Use budget, city, board, facilities, hostel, sports, and IIT/NEET goals. Return concise JSON."
- User: includes `Available schools: ${JSON.stringify(mockSchools)}` and `Parent preferences`.

Fallback:

```json
{
  "provider": "mock",
  "recommendations": [],
  "reasoning": "OpenAI key not configured. Returning deterministic sample recommendations."
}
```

Note:

- `mockSchools` is currently empty in `src/data/mock-schools.ts`. Populate it or use Prisma schools in the AI service for useful local recommendations.

### `cloudinary.service.ts`

Role:

- Uploads school media and deletes assets.

Methods:

- `uploadImage(filePath: string, folder = "schoolsetu")`
- `deleteAsset(publicId: string)`

Fallback:

```json
{ "skipped": true, "reason": "Cloudinary credentials not configured", "filePath": "..." }
```

### `razorpay.service.ts`

Role:

- Creates Razorpay orders for featured listing payments.

Method:

- `createOrder(amount: number, receipt: string)`

Fallback:

```json
{ "skipped": true, "reason": "Razorpay credentials not configured", "amount": 50000, "receipt": "featured_..." }
```

Payment verification:

- `payments.controller.ts` computes HMAC SHA-256 over `razorpay_order_id|razorpay_payment_id`.
- If `RAZORPAY_KEY_SECRET` is configured and signature mismatches, throws `400`.

Webhook:

- Current webhook only returns `{ received: true }`.
- Production must verify `x-razorpay-signature` using `RAZORPAY_WEBHOOK_SECRET`.

### `resend.service.ts`

Role:

- Sends inquiry confirmation emails.

Method:

- `sendMail(to, subject, html)`

Fallback:

```json
{ "skipped": true, "reason": "Resend credentials not configured", "to": "parent@example.com", "subject": "..." }
```

### `twilio.service.ts`

Role:

- Sends OTP SMS.
- Sends WhatsApp messages.

Methods:

- `sendSmsOtp(phone, otp)`
- `sendWhatsAppMessage(phone, body)`

Fallback:

```json
{ "skipped": true, "reason": "Twilio SMS credentials not configured", "phone": "+91...", "otp": "123456" }
```

### Dev fallback pattern

Provider services avoid crashing local development when credentials are missing. Instead, they return objects with:

```ts
{
  skipped: true;
  reason: string;
  ...context
}
```

This pattern is useful for local UI work, but production code should monitor skipped responses and never expose sensitive values such as OTPs.

## Security

### Helmet

`helmetMiddleware = helmet()` installs common secure headers:

- `X-DNS-Prefetch-Control`
- `X-Frame-Options`
- `X-Content-Type-Options`
- Referrer policy
- Content Security related defaults

### Rate limiting

Global API limit:

```ts
windowMs: 15 * 60 * 1000
limit: 300
```

OTP limit:

```ts
windowMs: 10 * 60 * 1000
limit: 5
```

Both use standard draft-8 rate limit headers and disable legacy headers.

### CORS

```ts
cors({
  origin: env.FRONTEND_URL,
  credentials: true
})
```

Production must set `FRONTEND_URL` to the deployed frontend origin.

### Zod validation

Used in:

- `auth.controller.ts`
- `schools.controller.ts`
- `inquiries.controller.ts`
- `ai.controller.ts`

Zod protects controllers from malformed request bodies and query params.

### JWT expiry

- Tokens expire in 7 days.
- `JWT_SECRET` must be strong in production.
- `development-secret` is only a local default.

## Error Handling

### `HttpError`

File: `src/utils/http-error.ts`

```ts
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}
```

Use it for expected API failures:

```ts
throw new HttpError(404, "School not found");
```

### `async-handler`

File: `src/utils/async-handler.ts`

It wraps async controllers:

```ts
Promise.resolve(handler(request, response, next)).catch(next);
```

This sends thrown async errors to the Express error handler.

### Error response format

Expected error:

```json
{ "error": "School not found" }
```

Unexpected error:

```json
{ "error": "Internal server error" }
```

Unexpected errors are logged with `console.error(error)`.

## Environment Variables

| Variable | Required | Service/file | What it does | Missing behavior |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | No | `config/env.ts` | Runtime mode. | Defaults to `development`. |
| `PORT` | No | `server.ts` | Port for Express server. | Defaults to `4000`. |
| `FRONTEND_URL` | No | `middleware/security.ts` | CORS origin. | Defaults to `http://localhost:3000`. |
| `DATABASE_URL` | Yes for DB endpoints | Prisma | PostgreSQL connection. | Env validation allows missing, but Prisma queries fail without it. |
| `JWT_SECRET` | Yes in production | Auth | Signs/verifies JWT. | Defaults to unsafe `development-secret`. |
| `OPENAI_API_KEY` | Optional | `ai.service.ts` | Enables OpenAI calls. | Returns provider `mock`. |
| `TWILIO_ACCOUNT_SID` | Optional | `twilio.service.ts` | Twilio account. | SMS/WhatsApp returns skipped. |
| `TWILIO_AUTH_TOKEN` | Optional | `twilio.service.ts` | Twilio auth. | SMS/WhatsApp returns skipped. |
| `TWILIO_PHONE_NUMBER` | Optional | `twilio.service.ts` | SMS sender. | SMS returns skipped. |
| `TWILIO_WHATSAPP_NUMBER` | Optional | `twilio.service.ts` | WhatsApp sender. | WhatsApp returns skipped. |
| `CLOUDINARY_CLOUD_NAME` | Optional | `cloudinary.service.ts` | Cloudinary account. | Upload/delete returns skipped. |
| `CLOUDINARY_API_KEY` | Optional | `cloudinary.service.ts` | Cloudinary key. | Upload/delete returns skipped. |
| `CLOUDINARY_API_SECRET` | Optional | `cloudinary.service.ts` | Cloudinary secret. | Upload/delete returns skipped. |
| `RESEND_API_KEY` | Optional | `resend.service.ts` | Email sending. | Email returns skipped. |
| `RAZORPAY_KEY_ID` | Optional | `razorpay.service.ts` | Razorpay order API. | Order creation returns skipped. |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay service/controller | Order API and payment signature verification. | Orders skipped; verification only enforces signature when secret exists. |
| `RAZORPAY_WEBHOOK_SECRET` | Pending | Webhook | Should verify Razorpay webhooks. | Currently not used. |

## Production Checklist

### Replace mock/stub data with Prisma queries

Current:

- School listing/detail use Prisma through `src/data/mock-schools.ts`.
- Admin endpoints still read `mockSchools`, currently empty.
- School create/update return shaped responses without persistence.

How:

1. Rename `src/data/mock-schools.ts` to `src/data/schools.repository.ts`.
2. Implement `createSchool` to write `School`, `SchoolAddress`, `SchoolDetails`, `SchoolAcademics`, `SchoolFees`, and `SchoolFacilities` in a transaction.
3. Implement `updateSchool` to create `PendingUpdate`.
4. Implement admin approve/reject to update `School.status`, `PendingUpdate.status`, and `ApprovalLog`.

### Add migrations and seed workflow

Current:

- Schema exists.
- Seed exists.

How:

```bash
$env:DATABASE_URL='postgresql://...'; npm run prisma:migrate --workspace backend
npm run prisma:generate --workspace backend
npm run seed --workspace backend
```

Add CI checks:

```bash
npx prisma validate --schema backend/src/prisma/schema.prisma
npm run typecheck --workspace backend
```

### OTP persistence with expiry cleanup

Current:

- OTP records persist and expire, but no cleanup job exists.

How:

1. Add a scheduled job or cron endpoint to delete old records:

```ts
await prisma.otpRecord.deleteMany({
  where: { expiresAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
});
```

2. Do not expose OTP in provider skipped responses outside local development.
3. Add resend cooldown metadata if UX requires it.

### File upload middleware

Current:

- `/api/upload/image` expects `{ filePath }`.

How:

1. Add multipart middleware such as `multer`.
2. Validate MIME type and file size.
3. Upload buffer/path to Cloudinary.
4. Persist `SchoolGallery` rows after successful upload.
5. Restrict school users to their own school assets.

### Razorpay webhook verification

Current:

- `/api/payments/webhook` only returns received.

How:

1. Add raw body parser for webhook route before `express.json`.
2. Compute HMAC with `RAZORPAY_WEBHOOK_SECRET`.
3. Compare with `x-razorpay-signature`.
4. Store event id to prevent replay.
5. Update `Payment.status`.
6. Create or activate `FeaturedListing`.

### Request logging

Current:

- `morgan("dev")` and `console.error`.

How:

1. Choose `pino` or `winston` already installed.
2. Add request id middleware.
3. Log method, path, status, duration, user id, role, and error stack.
4. Ship logs to hosting provider or external observability tool.

### Tests

Current:

- No test framework is configured.

How:

1. Add Vitest or Jest for unit tests.
2. Add Supertest for API integration tests.
3. Cover:
   - OTP send/verify.
   - `requireAuth` and `requireRole`.
   - School filters.
   - Inquiry duplicate prevention.
   - Payment signature verification.
   - Provider fallback responses.

### Spam detection

Current:

- Duplicate inquiry prevention blocks same parent/school within 7 days.

How:

1. Add per-phone and per-school inquiry rate limits.
2. Add IP-based inquiry throttling.
3. Add message keyword scoring.
4. Add admin review queue for suspicious leads.
5. Store lead quality metadata on `Inquiry` or a related table.

### Auth and ownership hardening

Current:

- `school` role exists, but school-user ownership is not modeled.
- Inquiry manager check compares `inquiry.schoolId` to `user.id`, which is not a robust ownership model.

How:

1. Add a `SchoolOwner` relation or `ownerId` on `School`.
2. Update `requireRole` protected controllers to verify ownership.
3. Add admin bypass intentionally.
4. Test school users cannot access other schools' inquiries.

### API documentation and client contracts

Current:

- This markdown is the source of API docs.

How:

1. Add OpenAPI generation or hand-written `openapi.yaml`.
2. Generate frontend API types or clients.
3. Keep Zod schemas close to controllers and reuse them for docs where possible.

## Development Commands

```bash
npm run dev --workspace backend
npm run typecheck --workspace backend
npm run build --workspace backend
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
```

Prisma validation from the repository root:

```bash
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/schoolsetu'; npx prisma validate --schema backend/src/prisma/schema.prisma
```


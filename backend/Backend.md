# SchoolSetu Backend Documentation

This document explains the SchoolSetu backend: architecture, files, API behavior, Prisma schema, authentication, service integrations, audit log system, security model, and production checklist.

## Purpose

The backend is the API layer for SchoolSetu, a school discovery and admission platform for Tier-2 and Tier-3 Indian cities. It owns authentication, school data, taxonomy, inquiries, moderation, media upload integration, AI recommendations, payments, provider wrappers, and a complete audit log for every admin action.

The project is a **modular monolith**:

- One Express app.
- Clear domain routers.
- Controllers for HTTP behavior.
- Services for external providers.
- Prisma for database access.
- Middleware for security, auth, audit logging, rate limiting, and error formatting.

## Tech Stack

| Package | Version range | Why it was chosen |
| --- | --- | --- |
| `express` | `^5.1.0` | Simple, mature HTTP API framework. |
| `typescript` | `^5.9.3` | Type safety across controllers, middleware, services, and Prisma. |
| `tsx` | `^4.20.6` | Runs TypeScript in development with watch mode. |
| `prisma` / `@prisma/client` | `^6.19.0` | Typed schema, migrations, generated client, relational query ergonomics. |
| `postgresql` | Prisma datasource | Relational model for schools, cities, boards, inquiries, payments, moderation, and audit logs. |
| `zod` | `^4.1.12` | Runtime request validation with readable schemas. |
| `jsonwebtoken` | `^9.0.2` | Stateless bearer-token auth for parent, school, and admin roles. |
| `helmet` | `^8.1.0` | Secure HTTP headers by default. |
| `express-rate-limit` | `^8.2.1` | Global throttling and stricter OTP throttling. |
| `cors` | `^2.8.5` | Restricts browser API access to `FRONTEND_URL`. |
| `morgan` | `^1.10.1` | Development request logging. |
| `openai` | `^6.8.1` | AI school recommendations. |
| `twilio` | `^5.10.4` | SMS OTP and WhatsApp messaging. |
| `resend` | `^6.4.0` | Inquiry confirmation emails. |
| `cloudinary` | `^2.8.0` | School images and gallery uploads. |
| `razorpay` | `^2.9.6` | Featured listing payments. |
| `pino`, `winston` | Installed | Future structured logging. |

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
    |   |-- audit.middleware.ts        ← NEW
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
    |   |-- audit.service.ts           ← NEW
    |   |-- cloudinary.service.ts
    |   |-- razorpay.service.ts
    |   |-- resend.service.ts
    |   |-- twilio.service.ts
    |-- utils/
        |-- async-handler.ts
        |-- http-error.ts
```

### Root files

| File | Explanation |
| --- | --- |
| `package.json` | Backend scripts: `dev`, `build`, `start`, `typecheck`, `seed`, `prisma:generate`, `prisma:migrate`. |
| `tsconfig.json` | TypeScript compiler settings for ESM output to `dist`. |
| `eslint.config.mjs` | ESLint flat config for TypeScript source. |

### App entry files

| File | Explanation |
| --- | --- |
| `src/app.ts` | Creates the Express app. Installs Helmet, CORS, API rate limit, JSON body parser, Morgan logger, `/api` routes, and final error handler. |
| `src/server.ts` | Imports `createApp()`, reads `env.PORT`, starts listening, logs the local API URL. |

### Config

| File | Explanation |
| --- | --- |
| `src/config/env.ts` | Loads `dotenv/config`, validates environment variables with Zod, sets local defaults. |
| `src/config/prisma.ts` | Exports the Prisma client singleton. Imported by all controllers and data helpers. |

### Controllers

| File | What it handles |
| --- | --- |
| `src/controllers/auth.controller.ts` | `sendOtp`, `verifyOtp`. Generates OTP, stores `OtpRecord`, sends Twilio SMS, verifies OTP in a transaction, upserts parent `User`, signs 7-day JWT. On successful admin login, writes `ADMIN_LOGIN` to `AuditLog`. |
| `src/controllers/schools.controller.ts` | School listing, detail lookup, registration submission, update submission, school inquiries stub. |
| `src/controllers/inquiries.controller.ts` | Create admission inquiry with duplicate prevention (7-day window), update inquiry status, add inquiry notes. |
| `src/controllers/ai.controller.ts` | Validates preferences and delegates recommendations to `aiService`. |
| `src/controllers/admin.controller.ts` | Full Prisma-backed admin operations: `listAdminSchools`, `approveSchool` (logs `SCHOOL_VERIFIED`), `rejectSchool` (logs `SCHOOL_REJECTED`), `editSchool` (diffs fields, logs `SCHOOL_EDITED`), `deleteSchool` (saves snapshot, logs `SCHOOL_DELETED`), `toggleFeatured` (logs `SCHOOL_FEATURED_TOGGLED`), `listModerationQueue`, `approveModerationItem`, `rejectModerationItem`. Also `listAuditLogs` and `auditLogStats`. |
| `src/controllers/media.controller.ts` | Cloudinary upload/delete HTTP handlers. |
| `src/controllers/payments.controller.ts` | Razorpay order creation, payment signature verification, webhook placeholder. |
| `src/controllers/taxonomy.controller.ts` | Lists cities, states, and boards with approved-school counts. |

### Routes

| File | What it mounts |
| --- | --- |
| `src/routes/index.ts` | Root `/api` router. Mounts all domain routers. |
| `src/routes/auth.routes.ts` | `/auth/send-otp`, `/auth/verify-otp`, `/auth/google`. |
| `src/routes/schools.routes.ts` | `/schools` listing/detail/create/update/school inquiries. |
| `src/routes/inquiries.routes.ts` | `/inquiries` create/status/notes. |
| `src/routes/ai.routes.ts` | `/ai/recommend`. |
| `src/routes/admin.routes.ts` | `/admin/*`, protected by `requireAuth` + `requireRole("admin")`. Includes: `/schools`, `/schools/:id/approve`, `/schools/:id/reject`, `/schools/:id/edit`, `/schools/:id` (DELETE), `/schools/:id/toggle-featured`, `/moderation`, `/moderation/:id/approve`, `/moderation/:id/reject`, `/audit-logs`, `/audit-logs/stats`. |
| `src/routes/media.routes.ts` | `/upload/image`, protected for `school` and `admin`. |
| `src/routes/payments.routes.ts` | `/payments/create-order`, `/payments/verify-payment`, `/payments/webhook`. |
| `src/routes/search.routes.ts` | `/search`, alias for school listing. |
| `src/routes/taxonomy.routes.ts` | `/cities`, `/states`, `/boards`. |

### Services

| File | Explanation |
| --- | --- |
| `src/services/audit.service.ts` | **NEW.** `createAuditLog(params)` — writes to `AuditLog` inside try/catch, never throws. `extractActor(req)` — extracts `actorId`, `actorEmail` (phone fallback), `actorRole`, `ipAddress`, `userAgent` from an Express request. |
| `src/services/ai.service.ts` | Wraps OpenAI. System prompt for Indian school recommendations. Returns JSON. Missing key returns provider `mock`. |
| `src/services/cloudinary.service.ts` | Configures Cloudinary when credentials exist. Uploads file paths, deletes assets. Missing credentials return skipped responses. |
| `src/services/razorpay.service.ts` | Creates Razorpay orders when keys exist. Missing keys return skipped response. |
| `src/services/resend.service.ts` | Sends emails from `SchoolSetu <noreply@schoolsetu.example>`. Missing key returns skipped response. |
| `src/services/twilio.service.ts` | Sends SMS OTP and WhatsApp messages. Missing credentials return skipped responses. |

### Middleware

| File | Explanation |
| --- | --- |
| `src/middleware/audit.middleware.ts` | **NEW.** `auditLog(action, targetType, getTargetInfoFn)` — wraps `res.json`, fires `createAuditLog` only on 2xx responses. Does not block the response if the audit write fails. |
| `src/middleware/auth.ts` | `requireAuth` (JWT verification), `requireRole(...roles)` (role check). |
| `src/middleware/error-handler.ts` | Converts `HttpError` to `{ error }` with status code. Unexpected errors return 500. |
| `src/middleware/security.ts` | Helmet, CORS, global API rate limit (300 req / 15 min), OTP rate limit (5 req / 10 min). |

### Utilities

| File | Explanation |
| --- | --- |
| `src/utils/async-handler.ts` | Wraps async controllers, forwards rejected promises to Express error middleware. |
| `src/utils/http-error.ts` | `HttpError(statusCode, message)` for expected API failures. |

### Data and Prisma

| File | Explanation |
| --- | --- |
| `src/data/mock-schools.ts` | Historical filename. Contains Prisma query helpers: `schoolInclude`, `buildSchoolWhere`, `findSchools`, `findSchoolBySlug`, plus an empty `mockSchools` export for older stubs. |
| `src/prisma/schema.prisma` | Full relational schema including `AuditAction` enum and `AuditLog` model. |
| `src/prisma/seed.ts` | Seeds Uttar Pradesh, target cities, boards, facilities, and sample Prayagraj schools. |

---

## Audit Log System

The audit log system records every significant admin action in the `AuditLog` table. It was designed to:

- **Never block the main operation** — audit writes are inside their own try/catch.
- **Capture before and after state** — `previousData` and `newData` are populated with the relevant fields.
- **Include actor metadata** — actor id, phone (as email fallback), role, IP address, user agent.

### `AuditAction` enum

```prisma
enum AuditAction {
  SCHOOL_VERIFIED
  SCHOOL_REJECTED
  SCHOOL_EDITED
  SCHOOL_DELETED
  SCHOOL_FEATURED_TOGGLED
  SCHOOL_CREATED
  USER_DEACTIVATED
  USER_REACTIVATED
  USER_ROLE_CHANGED
  TEAM_MEMBER_CREATED
  TEAM_MEMBER_DEACTIVATED
  TEAM_MEMBER_PERMISSIONS_UPDATED
  INQUIRY_STATUS_CHANGED
  INQUIRY_DELETED
  ADMIN_LOGIN
  ADMIN_LOGOUT
}
```

### `AuditLog` model

```prisma
model AuditLog {
  id            String      @id @default(cuid())
  actorId       String      @map("actor_id")
  actorEmail    String?     @map("actor_email")
  actorRole     String      @map("actor_role")
  actorTeamRole String?     @map("actor_team_role")
  action        AuditAction
  targetType    String      @map("target_type")
  targetId      String      @map("target_id")
  targetName    String?     @map("target_name")
  previousData  Json?       @map("previous_data")
  newData       Json?       @map("new_data")
  ipAddress     String?     @map("ip_address")
  userAgent     String?     @map("user_agent")
  notes         String?
  createdAt     DateTime    @default(now()) @map("created_at")

  @@index([actorId])
  @@index([action])
  @@index([targetType, targetId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

### `createAuditLog` — service

```ts
export async function createAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({ data: params });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}
```

### `extractActor` — service

```ts
export function extractActor(req) {
  return {
    actorId: req.user.id,
    actorEmail: req.user.phone ?? undefined,
    actorRole: req.user.role,
    ipAddress: req.ip ?? ...,
    userAgent: req.headers["user-agent"] ?? undefined,
  };
}
```

### `auditLog` — middleware

Response-intercepting middleware. Wraps `res.json` to fire audit log after 2xx response:

```ts
export function auditLog(action, targetType, getTargetInfo) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = async function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const targetInfo = getTargetInfo(req, data);
          await createAuditLog({ ...extractActor(req), action, targetType, ...targetInfo });
        } catch (e) { console.error("Audit middleware error:", e); }
      }
      return originalJson(data);
    };
    next();
  };
}
```

### Audit actions per controller

| Controller action | Audit action | `previousData` | `newData` |
| --- | --- | --- | --- |
| `approveSchool` | `SCHOOL_VERIFIED` | `{ status: previous.status }` | `{ status: "approved" }` |
| `rejectSchool` | `SCHOOL_REJECTED` | `{ status: previous.status }` | `{ status: "rejected" }` |
| `editSchool` | `SCHOOL_EDITED` | changed fields before | changed fields after |
| `deleteSchool` | `SCHOOL_DELETED` | full school snapshot | `{}` |
| `toggleFeatured` | `SCHOOL_FEATURED_TOGGLED` | `{ isFeatured: previous }` | `{ isFeatured: new }` |
| `verifyOtp` (admin only) | `ADMIN_LOGIN` | — | — |

### Audit log API endpoints

#### `GET /api/admin/audit-logs`

Query params: `page`, `limit`, `actorId`, `action`, `targetType`, `targetId`, `from`, `to`, `search` (matches actor email/target name/notes).

Response:
```json
{
  "data": [{ "id": "...", "action": "SCHOOL_VERIFIED", "actorEmail": "...", "createdAt": "...", ... }],
  "pagination": { "page": 1, "limit": 25, "total": 120, "totalPages": 5 }
}
```

#### `GET /api/admin/audit-logs/stats`

Response:
```json
{
  "last30Days": 47,
  "byAction": [{ "action": "SCHOOL_VERIFIED", "_count": { "id": 12 } }],
  "byActor": [{ "actorEmail": "...", "_count": { "id": 8 } }],
  "dangerActions": [{ "id": "...", "action": "SCHOOL_DELETED", ... }]
}
```

---

## API Reference

Base path: `/api`

Error format: `{ "error": "Message here" }`

### Health

#### `GET /api/health`
```json
{ "status": "ok", "service": "schoolsetu-api" }
```

### Auth

#### `POST /api/auth/send-otp`
Rate limit: 5 requests / 10 minutes.
Body: `{ phone: string }`
Response: `{ "success": true }`

Notes:
- OTP expires in 5 minutes.
- Existing unused OTPs for the same phone are marked used.
- Twilio returns skipped response if credentials are missing.

#### `POST /api/auth/verify-otp`
Body: `{ phone: string; otp: string }` (6 digits)
Response: `{ "success": true, "token": "jwt...", "user": { "id": "...", "phone": "...", "role": "parent" } }`

Notes:
- OTP is verified and marked used inside a Prisma transaction.
- JWT payload: `{ id, role, phone }`, expires in `7d`.
- If `user.role === "admin"`, writes `ADMIN_LOGIN` to `AuditLog`.

#### `POST /api/auth/google`
Response: `{ "message": "Google OAuth callback is handled by Auth.js on the frontend." }` — placeholder.

### Schools

#### `GET /api/schools`
Query: `q`, `city`, `board`, `facility`, `category`, `page` (default 1), `limit` (default 12, max 50).
Response: `{ "data": [...], "pagination": { "page", "limit", "total", "totalPages" } }`

#### `GET /api/schools/:slug`
Response: `{ "data": { ...school } }`
Error: `404` if no approved school matches the slug.

#### `POST /api/schools` — `school` or `admin`
Current: returns moderation-shaped response without full persistence.

#### `PUT /api/schools/:id` — `school` or `admin`
Current: returns `PendingUpdate`-shaped response without full persistence.

### Admin

All admin routes require `Authorization: Bearer <admin-jwt>`.

#### `GET /api/admin/schools`
Response: `{ "data": [...schools] }` — Prisma-backed.

#### `PUT /api/admin/schools/:id/approve`
Body: `{ notes?: string }`
Response: `{ "message": "School approved", "school": { ... } }`
Audit: `SCHOOL_VERIFIED` with `previousData.status` → `newData.status: "approved"`.

#### `PUT /api/admin/schools/:id/reject`
Body: `{ reason?: string }`
Response: `{ "message": "School rejected", "school": { ... } }`
Audit: `SCHOOL_REJECTED` with status diff.

#### `PUT /api/admin/schools/:id/edit`
Body: any subset of school fields.
Response: `{ "message": "School updated", "school": { ... } }`
Audit: `SCHOOL_EDITED` with only the changed fields in `previousData`/`newData`.

#### `DELETE /api/admin/schools/:id`
Response: `{ "message": "School deleted" }`
Audit: `SCHOOL_DELETED` — full school snapshot saved in `previousData`.

#### `PUT /api/admin/schools/:id/toggle-featured`
Response: `{ "message": "...", "school": { ... } }`
Audit: `SCHOOL_FEATURED_TOGGLED` with boolean diff.

#### `GET /api/admin/moderation`
Response: `{ "data": [] }` — stub.

#### `PUT /api/admin/moderation/:id/approve` / `reject`
Current: stubs.

#### `GET /api/admin/audit-logs`
Query: `page`, `limit`, `actorId`, `action`, `targetType`, `targetId`, `from`, `to`, `search`.
Response: `{ "data": [...], "pagination": { ... } }`

#### `GET /api/admin/audit-logs/stats`
Response: `{ "last30Days": 47, "byAction": [...], "byActor": [...], "dangerActions": [...] }`

### Inquiries

#### `POST /api/inquiries` — `parent`
Body: `{ schoolId, parentName, phone, email?, message?, childName?, grade? }`
Response: `{ "data": { inquiry with school + parent } }`
Error: `409` for duplicate inquiry within 7 days.

#### `PUT /api/inquiries/:id/status` — `school` or `admin`
Body: `{ status: "CONTACTED" | "ADMITTED" | "REJECTED" }`

#### `POST /api/inquiries/:id/notes` — `school` or `admin`
Body: `{ note: string }`

### AI

#### `POST /api/ai/recommend`
Body: `{ preferences: string }` (min 10 chars)
Response: `{ "data": { "provider": "mock" | "openai", "recommendations": [...] } }`

### Media

#### `POST /api/upload/image` — `school` or `admin`
Body: `{ filePath: string }`
Limitation: no multipart middleware. Expects a server-accessible file path.

#### `DELETE /api/upload/image/:id` — `school` or `admin`

### Payments

#### `POST /api/payments/create-order` — `school` or `admin`
Body: `{ amount: number }`

#### `POST /api/payments/verify-payment` — `school` or `admin`
Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`

#### `POST /api/payments/webhook`
Placeholder. Returns `{ "received": true }`.

### Taxonomy

#### `GET /api/cities` — cities with approved school counts.
#### `GET /api/states` — states with nested city counts.
#### `GET /api/boards` — boards with approved school counts.

---

## Prisma Schema

### Enums

| Enum | Values | Purpose |
| --- | --- | --- |
| `UserRole` | `parent`, `school`, `admin` | Auth and authorization roles. |
| `SchoolStatus` | `pending`, `approved`, `rejected` | Listing moderation state. |
| `InquiryStatus` | `new`, `contacted`, `interested`, `converted`, `closed`, `admitted`, `rejected` | Admission lead lifecycle. |
| `PendingUpdateStatus` | `pending`, `approved`, `rejected` | School update moderation state. |
| `GalleryType` | `photo`, `video` | School gallery media type. |
| `AuditAction` | 16 values (see above) | Admin action types for audit logging. |

### Key Models

| Model | Purpose |
| --- | --- |
| `User` | Parents, schools, and admins. `id`, `name`, `email`, `phone`, `role`, `googleId`. |
| `OtpRecord` | OTP codes, expiry, used flag. Indexes on `[phone, otp, used]` and `[expiresAt]`. |
| `State` | State taxonomy (`id`, `name`, `slug`). |
| `City` | City taxonomy with `slug`, `hasSchools`, `stateId`. |
| `Board` | Education board taxonomy. |
| `School` | Core listing record with city, board, status, type, medium, featured flag. |
| `SchoolDetails` | Principal, year, affiliation, website, email, phone, WhatsApp. |
| `SchoolAddress` | Address, pincode, coordinates, Google Maps URL. |
| `SchoolAcademics` | Streams, class range, admission window, documents required. |
| `SchoolFees` | Admission, tuition, transport, hostel, exam fees. |
| `SchoolFacilities` | 12 boolean facility flags (library, labs, hostel, transport, etc.). |
| `SchoolGallery` | Cloudinary URLs, captions, ordering. |
| `SchoolSection` | Flexible content sections (sports, hostel, IIT/NEET). |
| `SchoolAchievement` | Awards and accomplishments. |
| `Facility` | Facility taxonomy. |
| `Inquiry` | Admission lead linking parent and school. |
| `InquiryNote` | Operational notes on an inquiry. |
| `PendingUpdate` | Moderated changes to school profile data. |
| `ApprovalLog` | Admin approval/rejection history. |
| `FeaturedListing` | Paid placement windows. |
| `Payment` | Razorpay order/payment tracking. |
| `BlogPost` | SEO content articles. |
| `SeoPage` | Custom metadata for landing pages. |
| `AuditLog` | **NEW** — Complete action history with actor, target, before/after state, IP, user agent. |

---

## Authentication System

### JWT payload

```ts
type AuthRole = "parent" | "school" | "admin";
type AuthUser = { id: string; role: AuthRole; phone?: string };
```

Signed with: `jwt.sign({ id, role, phone }, env.JWT_SECRET, { expiresIn: "7d" })`

### `requireAuth`

1. Reads `Authorization: Bearer <token>`.
2. If missing, throws `HttpError(401, "Authentication required")`.
3. Verifies with `env.JWT_SECRET`.
4. Assigns decoded payload to `request.user`.
5. Calls `next()`.

### `requireRole(...roles)`

1. Checks `request.user.role` is in allowed roles.
2. Throws `HttpError(403)` if not.

---

## Service Layer

### Dev fallback pattern

All provider services return a safe skipped object when credentials are absent:

```ts
{ skipped: true; reason: string; ...context }
```

This allows local UI work without crashing. Production must never expose sensitive values (like OTPs) in these responses.

### Provider summaries

| Service | Method(s) | Missing credential behavior |
| --- | --- | --- |
| Twilio | `sendSmsOtp`, `sendWhatsAppMessage` | Returns `{ skipped: true, reason, phone, otp }`. |
| Cloudinary | `uploadImage`, `deleteAsset` | Returns skipped. |
| OpenAI | `getRecommendations` | Returns `{ provider: "mock", recommendations: [], reasoning: "..." }`. |
| Resend | `sendMail` | Returns skipped. |
| Razorpay | `createOrder` | Returns skipped. |

---

## Security

### Helmet
Installs secure HTTP headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-DNS-Prefetch-Control`, referrer policy, CSP defaults.

### Rate limits
- Global API: 300 requests / 15 minutes.
- OTP specific: 5 requests / 10 minutes.

### CORS
```ts
cors({ origin: env.FRONTEND_URL, credentials: true })
```

### Zod validation
Used in `auth.controller.ts`, `schools.controller.ts`, `inquiries.controller.ts`, `ai.controller.ts`.

### JWT expiry
7 days. `JWT_SECRET` must be strong in production. `development-secret` is the unsafe local default.

---

## Error Handling

### `HttpError`
```ts
export class HttpError extends Error {
  constructor(public statusCode: number, message: string) { super(message); }
}
```

### `asyncHandler`
```ts
Promise.resolve(handler(request, response, next)).catch(next);
```

### Error responses
- Expected: `{ "error": "School not found" }` with correct status.
- Unexpected: `{ "error": "Internal server error" }` with 500.

---

## Environment Variables

| Variable | Required | Used by | Missing behavior |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `config/env.ts` | Defaults to `development`. |
| `PORT` | No | `server.ts` | Defaults to `4000`. |
| `FRONTEND_URL` | No | CORS | Defaults to `http://localhost:3000`. |
| `DATABASE_URL` | Yes for DB | Prisma | Prisma queries fail without it. |
| `JWT_SECRET` | Yes in prod | Auth | Defaults to unsafe `development-secret`. |
| `OPENAI_API_KEY` | Optional | `ai.service.ts` | Returns mock recommendations. |
| `TWILIO_ACCOUNT_SID` | Optional | `twilio.service.ts` | SMS/WhatsApp returns skipped. |
| `TWILIO_AUTH_TOKEN` | Optional | `twilio.service.ts` | SMS/WhatsApp returns skipped. |
| `TWILIO_PHONE_NUMBER` | Optional | `twilio.service.ts` | SMS returns skipped. |
| `TWILIO_WHATSAPP_NUMBER` | Optional | `twilio.service.ts` | WhatsApp returns skipped. |
| `CLOUDINARY_CLOUD_NAME` | Optional | `cloudinary.service.ts` | Upload/delete returns skipped. |
| `CLOUDINARY_API_KEY` | Optional | `cloudinary.service.ts` | Upload/delete returns skipped. |
| `CLOUDINARY_API_SECRET` | Optional | `cloudinary.service.ts` | Upload/delete returns skipped. |
| `RESEND_API_KEY` | Optional | `resend.service.ts` | Email returns skipped. |
| `RAZORPAY_KEY_ID` | Optional | `razorpay.service.ts` | Order creation returns skipped. |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay verify | Orders skipped; signature only enforced when present. |
| `RAZORPAY_WEBHOOK_SECRET` | Pending | Webhook | Not yet consumed. |

---

## Production Checklist

### Run the AuditLog migration

```bash
$env:DATABASE_URL='postgresql://...'; npx prisma migrate dev --name add_audit_log
npx prisma generate
```

### Persist school registration and updates

Current `POST /api/schools` and `PUT /api/schools/:id` return shaped responses without writing to Prisma.

1. Validate body with Zod.
2. Write `School`, `SchoolAddress`, `SchoolDetails`, `SchoolAcademics`, `SchoolFees`, `SchoolFacilities` in a transaction.
3. For updates, create `PendingUpdate`.
4. Implement admin approve/reject to update `School.status` and write `ApprovalLog`.

### Add file upload middleware

Current: API expects `{ filePath }` in body.

1. Add `multer` for multipart uploads.
2. Validate MIME type and file size.
3. Upload buffer to Cloudinary.
4. Persist `SchoolGallery` rows.
5. Restrict school users to their own school assets.

### Implement Razorpay webhook verification

1. Raw body parser before `express.json()` for webhook route.
2. Compute HMAC with `RAZORPAY_WEBHOOK_SECRET`.
3. Compare with `x-razorpay-signature`.
4. Store event id to prevent replay.
5. Activate `FeaturedListing` on payment success.

### Add OTP cleanup job

```ts
await prisma.otpRecord.deleteMany({
  where: { expiresAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
});
```

Do not expose OTPs in Twilio skipped responses outside local development.

### School ownership hardening

Current `school` role exists but no school-user ownership relation is modeled. Inquiry manager check uses `inquiry.schoolId === user.id` which is not robust.

1. Add `ownerId` on `School`.
2. Update protected controllers to verify ownership.
3. Add explicit admin bypass.
4. Test school users cannot access other schools' inquiries.

### Structured request logging

Current: `morgan("dev")` + `console.error`.

1. Choose `pino` or `winston`.
2. Add request id middleware.
3. Log method, path, status, duration, user id, role, error stack.
4. Ship logs to observability tool.

### Tests

No test framework is configured yet.

1. Add Vitest or Jest for unit tests.
2. Add Supertest for API integration tests.
3. Cover: OTP send/verify, `requireAuth`/`requireRole`, school filters, inquiry duplicate prevention, payment signature verification, provider fallbacks, and audit log writes.

---

## Development Commands

```bash
npm run dev --workspace backend
npm run typecheck --workspace backend
npm run build --workspace backend
npm run prisma:generate --workspace backend
npm run prisma:migrate --workspace backend
```

Prisma schema validation from repo root:

```bash
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/schoolsetu'; npx prisma validate --schema backend/src/prisma/schema.prisma
```

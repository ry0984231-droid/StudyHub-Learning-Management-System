# StudyHub project review

## Latest feature audit

The latest stabilization pass also fixed zero-cost enrollment routing, admin access to unpublished course management, and Settings profile persistence. New course prices/statuses are validated; paid-course orders check purchasability and use request timeouts. Lesson metadata/video access and unpublished course details are restricted. Persistence now writes only changed/removed records rather than replacing whole collections, and mutation endpoints wait for persistence. MongoDB connection attempts use a 10-second server selection timeout, and payment IDs/order IDs have unique sparse indexes.

The latest source/API contract scan found and fixed frontend navigation issues: Home course cards used an invalid view name; Course Details used invalid checkout/learning view names; and lesson edit URLs did not restore the lesson ID on refresh. Protected views now wait for auth restoration and admin/instructor routes check roles. The final production build, `npm run check`, and backend file syntax checks passed. An Express route integration smoke run passed 25 assertions using mocked persistence; a separate persistence-diff test confirmed targeted insert/update/delete behavior while retaining unrelated records. Neither substitutes for a live MongoDB, browser, SMTP, or Razorpay test.

Source-implemented feature areas include email/password auth and OTP reset, course browsing and instructor CRUD, lesson management/progress, quizzes, reviews, wishlist, notifications, admin/instructor dashboards, Razorpay checkout/verification, and certificates. Google sign-in and AI chat are intentionally removed. Real MongoDB, SMTP, and Razorpay integrations remain unverified because this environment has no reachable database or configured service validation.

Reviewed source: `StudyHub-Frontend-Complete` as present in this workspace. This is a static source review; no live MongoDB, Razorpay, SMTP, Google OAuth, or Gemini credentials were supplied, so external flows could not be exercised. There are no Mongoose models: the backend uses MongoDB's native driver and stores whole collections in process memory.

**Follow-up status:** Docker entrypoint and cross-platform npm scripts are fixed; Compose now includes the app; `.env.example` is expanded; public instructor self-registration is disabled; local lesson video delivery now checks preview/enrollment/ownership; Google and AI call paths were removed as requested. The production build and `npm run check` pass. Docker is not installed here, so Compose could not be run. Findings marked below as “fixed” supersede the initial observations. In-memory persistence and payment idempotency concerns remain open.

## Executive summary

The project has a recognizable React/Vite + Express + MongoDB structure and implements many LMS flows. The build and source-level integration smoke checks pass. Production readiness still depends on validating a real MongoDB deployment and external services, and completing payment/enrollment atomicity and deployment checks. Google sign-in and AI chat are intentionally removed.

Priority key: 🔴 critical, 🟠 high, 🟡 medium, 🟢 low.

## A. Architecture and structure

- Frontend: `src/pages`, `src/components`, `src/context`, and `src/services` are separated sensibly. `App.jsx` implements a hand-written history router rather than React Router; it parses URLs and gates some content, but route authorization needs a dedicated, complete policy.
- Backend: `server.js`, `server/routes`, `server/controllers`, `server/middleware`, `server/config`, and `server/db` provide basic separation. Controllers directly read and mutate a shared in-memory `DocumentStore`; a repository/service layer and database-enforced atomic operations are absent.
- Persistence: `server/db/store.js` uses MongoDB native collections, not Mongoose. There are no schema/model files, transactions, migrations, or comprehensive indexes. All collections are loaded into memory at startup.
- No separate test suite or backend/frontend test scripts are present. Deployment/configuration files exist but conflict (see deployment section).

## B. Working/implemented feature surface

Source includes account registration/login/password reset, course browse/detail/CRUD, lessons/video upload, enrollments/progress, quizzes, Razorpay order/verification/history, certificates and public verification, reviews, wishlist, notifications, admin/instructor endpoints, contact submission, SMTP OTP delivery, and dashboard pages. Route-level source smoke checks passed for flows that do not need external providers.

## C. Critical and high-priority findings

### ✅ Docker entrypoint and npm scripts (fixed; runtime unverified)

Docker now runs the generated `dist/server.mjs`; start and clean use cross-platform Node commands. Docker/Compose could not be launched because Docker is unavailable in this environment.

### ✅ Free/paid enrollment checks (route integration tested)

The route now requires the student role, validates prices, enrolls free courses, and returns 402 for unpaid paid courses. The integration smoke test covered both paths; real gateway verification is still untested.

### 🔴 3. Persistence can delete valid data / is unsafe across instances

`DocumentStore.save()` now diffs its loaded snapshot and persists only changed records and IDs removed by this process; it no longer deletes unrelated database records or rewrites every collection. A mock-collection test covered insert/update/targeted delete. The app still caches all records in memory, and concurrent edits to the same document can overwrite each other. Transactions and database-side pagination are absent; validate before scaling beyond one app instance.

### ✅ Public instructor self-registration (fixed)

Public registration now always creates a student. Admins promote trusted accounts through user management.

### 🟠 5. AI chat is intentionally unavailable

The AI chat helper and Google sign-in path were removed at the user's request. No Gemini calls are made; no Gemini 503 can occur in this version. The unused SDK/configuration can be removed from dependencies separately if desired.

### 🟠 6. Google sign-in is intentionally unavailable

The frontend Google sign-in method and backend route/controller have been removed at the user's request. Email/password authentication remains available.

### ✅ Local video access is checked (route integration tested)

The public `/uploads` static mount is removed. Local videos use short-lived signed lesson tickets and check preview/enrollment/ownership; a route test covered free-preview streaming and hidden paid-video URLs for anonymous users. Multer still trusts client MIME type, so inspect file content and clean up uploaded files when database writes fail.

### 🟠 8. Payments lack durable unique/idempotent persistence

Payment/order IDs now have unique sparse indexes; order creation validates published status and price bounds and gateway calls have timeouts. Payment, enrollment, student count, and notification writes are not transactional. Concurrent verification and webhook recovery remain unverified against a real gateway.

## D. Medium and low findings

- 🟡 `api.js` returns only the error message and drops field-level validation errors, making forms harder to correct. Preserve status and structured `errors` on a custom API error.
- 🟡 Auth tokens are stored in `localStorage`; XSS can steal them. Consider secure, HttpOnly, SameSite cookies and CSRF protections. At minimum, apply a strict CSP in production and avoid rendering untrusted HTML.
- 🟡 `server.js` reads `config.nodeEnv` to configure Helmet but checks `process.env.NODE_ENV` separately for Vite/static serving. Use one validated configuration source.
- 🟡 CORS accepts one configured origin, which is appropriate for a single frontend deployment but must be set correctly; defaulting to localhost will block a separately hosted frontend.
- 🟡 No pagination is evident in list endpoints; controllers build results from full in-memory arrays. This will become slow and memory-heavy as records grow.
- 🟡 `otpStore` is in-memory, has no cleanup, is lost at restart, and OTP verification then reset each increment attempts. Use a shared TTL store, rate limit reset endpoints, and exchange successful OTP verification for a short-lived single-use reset token.
- 🟡 Contact messages are saved to a collection but there is no admin read/manage endpoint in the route table.
- 🟡 `docker-compose.yml` exposes MongoDB on all host interfaces by default and defines no database credentials or `MONGODB_URI` for the app. Keep the DB private and configure authentication/secrets for deployments.
- 🟢 Several response messages and currency strings display mojibake in the checked source (for example `StudyHub â€“` and `â‚¹`). Save source as UTF-8 and replace corrupted literals.
- 🟢 `.env.example` documents only `APP_URL`, `CLIENT_URL`, and `NODE_ENV`, while backend requires `MONGODB_URI` and a 32-character `JWT_SECRET` and optionally uses Razorpay/SMTP/Google. Document all variables with safe placeholders.

## E. Authentication and authorization

- Passwords are hashed with bcrypt and excluded from auth responses by `safe()`. JWTs expire after seven days; no revocation/session version is implemented, so logout only clears the current browser token.
- `protect` verifies the JWT and reloads the current user from the in-memory cache; role changes take effect for requests because authorization reads the cached user, but not necessarily across instances.
- Admin endpoints generally use `authorize("admin")`. Course update/delete and lesson/quizzes have ownership checks in relevant controllers. Audit all object operations whenever adding routes; route-level authentication alone does not prevent IDOR.
- Public registration now always assigns the student role. Admin role assignment is protected and prevents self role changes; admin actions are not separately audited.
- Profile/password/reset endpoints lack comprehensive Zod validation. `updateProfile` accepts arbitrary-length values and arbitrary avatar URLs; validate and constrain every field.
- Forgot-password response avoids user enumeration for missing users, but behavior differs for existing users if SMTP fails (503); this can still reveal account existence.

## F. Course, student, instructor, and admin capabilities

Course/lesson CRUD, browse, enrollment/progress, quiz, wishlist, certificate, dashboard, admin user/role/course/payment pages have source implementations. Published/unpublished rules, instructor ownership, review eligibility, completion rules, and dashboard accuracy depend on controller checks and were not verified against running data. Confirm student-only enrollment/review actions, protect video delivery, and ensure deletion cascades or archives dependent lessons, enrollments, attempts, payments, and certificates instead of leaving orphans. No explicit course pagination endpoint is visible.

## G. Payment review

The backend creates Razorpay orders server-side and validates HMAC signatures with timing-safe comparison, then fetches the order and checks user/course/amount/currency notes. Calls have a 15-second timeout; payment and order IDs have unique sparse indexes. Payment/enrollment/notification writes are not transactional, and webhook recovery and live gateway behavior were not tested. The client sends payment method metadata, which is not treated as proof of payment.

## H. Certificates and email

Certificate endpoints include authenticated retrieval and public verification. Generation checks enrollment and required assessment completion in `certificateController.js`; test that all required lessons are complete, not only assessments, if that is the intended policy. Public verification should return only minimal certificate fields. Email config is server-only and SMTP port/secure are configurable. Transport errors are generalized to the caller, but there is no SMTP connection verification/health check or retry queue; OTP is not durable or single-use after verification.

## I. API inventory

All routes below are mounted beneath `/api`. “Role” is controller/route intent; public means no `protect` middleware. Status means present in source, not runtime-tested.

| Method | Endpoint | Purpose | Auth required | Role | Status |
|---|---|---|---|---|---|
| GET | `/health` | Health check | No | Any | Present |
| POST | `/auth/register` | Register | No | Student/instructor (currently unsafe) | Present |
| POST | `/auth/login` | Login | No | Any | Present |
| GET | `/auth/me` | Current user | Yes | Any | Present |
| POST | `/auth/forgot-password` | Send reset OTP | No | Any | Present |
| POST | `/auth/verify-otp` | Verify OTP | No | Any | Present |
| POST | `/auth/reset-password` | Reset password | No | Any | Present |
| PUT | `/auth/profile` | Edit profile | Yes | Any | Present |
| PUT | `/auth/change-password` | Change password | Yes | Any | Present |
| GET | `/home/overview` | Home overview | No | Any | Present |
| GET | `/courses` | Browse/search courses | No | Any | Present |
| GET | `/courses/categories` | Categories | No | Any | Present |
| GET | `/courses/:id` | Course detail | No | Any | Present |
| GET | `/instructor/courses` | Instructor courses | Yes | Instructor/admin | Present |
| POST | `/courses` | Create course | Yes | Instructor/admin | Present |
| PUT | `/courses/:id` | Edit course | Yes | Owner/admin | Present |
| DELETE | `/courses/:id` | Delete course | Yes | Owner/admin | Present |
| GET | `/lessons/course/:courseId` | Course lessons | No | Any (media exposure concern) | Present |
| GET | `/lessons/:id` | Lesson detail | No | Any (media exposure concern) | Present |
| POST | `/lessons` | Add lesson/video | Yes | Instructor/admin | Present |
| PUT | `/lessons/reorder` | Reorder lessons | Yes | Instructor/admin | Present |
| PUT | `/lessons/:id` | Edit lesson | Yes | Owner/admin | Present |
| DELETE | `/lessons/:id` | Delete lesson | Yes | Owner/admin | Present |
| GET | `/enrollments/mine` | My enrollments | Yes | Any (should be student) | Present |
| GET | `/enrollments/check/:courseId` | Check enrollment | Yes | Any | Present |
| POST | `/enrollments/enroll` | Free/eligible enrollment | Yes | Should be student | Present |
| POST | `/enrollments/complete-lesson` | Mark lesson complete | Yes | Enrolled learner | Present |
| GET | `/enrollments/activity` | Learning activity | Yes | Any | Present |
| GET | `/quizzes` | List quizzes | Yes | Any | Present |
| GET | `/quizzes/:id` | Quiz details | Yes | Any | Present |
| POST | `/quizzes/:id/submit` | Submit quiz | Yes | Learner | Present |
| GET | `/quizzes/:id/results` | Quiz results | Yes | Owner/instructor/admin | Present |
| POST | `/quizzes` | Create quiz | Yes | Instructor/admin | Present |
| PUT | `/quizzes/:id` | Edit quiz | Yes | Owner/admin | Present |
| DELETE | `/quizzes/:id` | Delete quiz | Yes | Owner/admin | Present |
| POST | `/payments/create-order` | Create Razorpay order | Yes | Any (restrict as appropriate) | Present |
| POST | `/payments/verify` | Verify and enroll | Yes | Any (restrict as appropriate) | Present |
| GET | `/payments/history` | My payments | Yes | Any | Present |
| GET | `/admin/payments` | All payments | Yes | Admin | Present |
| GET | `/certificates/my` | My certificates | Yes | Any | Present |
| POST | `/certificates/generate` | Generate certificate | Yes | Eligible learner | Present |
| GET | `/certificates/verify/:certificateId` | Public verification | No | Any | Present |
| GET | `/certificates/:id` | Certificate detail | Yes | Owner/admin | Present |
| GET | `/reviews/course/:courseId` | Course reviews | No | Any | Present |
| POST | `/reviews` | Add review | Yes | Enrolled learner (check) | Present |
| GET | `/wishlist` | My wishlist | Yes | Any | Present |
| POST | `/wishlist/toggle/:courseId` | Toggle wishlist | Yes | Any | Present |
| GET | `/notifications` | My notifications | Yes | Any | Present |
| PUT | `/notifications/read-all` | Mark all read | Yes | Any | Present |
| PUT | `/notifications/:id/read` | Mark one read | Yes | Owner check | Present |
| GET | `/instructor/stats` | Instructor stats | Yes | Instructor/admin | Present |
| GET | `/instructor/students` | Instructor students | Yes | Instructor/admin | Present |
| GET | `/admin/metrics` | Admin metrics | Yes | Admin | Present |
| GET | `/admin/users` | List users | Yes | Admin | Present |
| PUT | `/admin/users/:id/role` | Change user role | Yes | Admin | Present |
| DELETE | `/admin/users/:id` | Delete user | Yes | Admin | Present |
| POST | `/contact` | Submit contact form | No | Any | Present; no admin inbox API |
| POST | `/ai/chat` | Gemini assistant | — | — | Not implemented; AI helper removed by request |

## J. Frontend/API mismatches

- Google sign-in and AI chat are absent by request; no frontend calls to either route remain.
- `api.reorderLessons()` is not exposed even though backend has a reorder route (no call was found in page source).
- API wrapper discards HTTP status and validation details; backend response shapes are not uniform (`data`, named properties, success/message).
- Verify actual API contract in `CourseDetailsPage.jsx`, `CheckoutPaymentPage.jsx`, and dashboards before changing response fields; no live integration tests are present.

## K. Environment and deployment

Backend secrets (`JWT_SECRET`, `MONGODB_URI`, SMTP, and Razorpay) are read server-side. No `VITE_*` secret exposure was found. Google/Gemini configuration was removed, and `.env.example` now documents required database/JWT variables and optional service settings.

Docker/Compose now builds and launches both app and MongoDB but was not runtime-tested because Docker is unavailable here. Production static serving expects `dist/index.html` and `dist/server.mjs`. Validate `CLIENT_URL`, `APP_URL`, `PORT`, `MONGODB_DB_NAME`, and secrets in deployment.

## L. Recommended folder structure

Preserve the current layout while migrating persistence and adding missing domain pieces:

```text
src/
  components/  context/  pages/  services/  routes/
server/
  config/  middleware/  routes/
  modules/<domain>/{controller,service,repository,validation}.js
  models/              # Mongoose schemas if adopting Mongoose
  services/            # email, payments, Gemini
  db/                   # connection, migrations/indexes
```

Avoid a wholesale rewrite. Keep scaling to a single app instance until the in-memory cache is replaced with database-side queries and transactional writes are designed for payment enrollment.

## M. Validation and production checklist

### Before release

- [ ] Build and start the Docker image in an environment with Docker installed.
- [ ] Force public registration to student; verify only admin can promote accounts.
- [ ] Test free course enrollment and paid course checkout as student, instructor, and admin.
- [ ] Validate snapshot-diff persistence against the production MongoDB and implement transactional payment/enrollment writes where supported.
- [ ] Protect lesson/video access and validate file content/size.
- [ ] Add `/ai/chat` or remove the AI UI/helper. Keep Gemini credentials server-side and return useful normalized 429/503/timeout errors.
- [ ] Add the missing `api.googleLogin` helper and test Google OAuth end to end.
- [ ] Configure production secrets in the hosting provider and keep `.env` out of version control.
- [ ] Validate all inputs with schemas, including profile, password reset, course/lesson, quiz, payment, and IDs.
- [ ] Add database pagination and indexes based on query patterns.
- [ ] Configure MongoDB authentication/network isolation, backups, TLS, and production CORS.
- [ ] Add automated tests for authorization/IDOR, password reset, payment verification/idempotency, progress/certificates, and startup/deployment.
- [ ] Confirm mobile layouts, keyboard/focus access, empty/error/loading states, and server-side error reporting.

### Review scope limitations

This report is grounded in checked-in files. No actual `.env` file appeared in the project file listing; secrets cannot be audited outside the supplied workspace. Runtime behavior, third-party service availability, responsive rendering, and production deployment were not exercised. Treat any behavior described as implemented as source-level evidence, not an end-to-end guarantee.

# Elevate Workforce Solutions - Application Development Assignmnet

Job portal for **job seekers**, **employers** and **admins**.

- Public job list and company pages
- Register / login / logout (HttpOnly JWT cookie)
- Employers post, edit and close jobs
- Seekers apply once per job
- Admin moderates users, companies, jobs and applications

```
Browser  →  frontend :3001 (Next.js)
         →  backend  :4000 (Express MVC)
         →  PostgreSQL 16  +  Redis 7
```

There are **10 API modules** and **67 HTTP endpoints**. Full tables are below.

Copy `.env.example`. **Do not commit** `.env` or `.env.local`.

---

## 1. How to start the app

Docker Desktop must be running.

### Step A — databases and mail

```bash
docker compose up -d
docker compose ps
```

| Service | URL | Notes |
| --- | --- | --- |
| PostgreSQL | `localhost:5432` | user `dev` / password `dev` / db `myjobportal` |
| Redis | `localhost:6379` | JWT blacklist, cache, rate limits |
| Seq | http://localhost:5341 | API logs |
| smtp4dev | http://localhost:3000 | password-reset emails (SMTP `2525`) |

Stop containers: `docker compose down`  
Stop and **delete data volumes**: `docker compose down -v`

### Step B — API (`:4000`)

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Windows PowerShell:

```powershell
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Check: http://localhost:4000/api/health

### Step C — website (`:3001`)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3001

---

## 2. Database: seed and un-seed

Seed script: `backend/prisma/seed.ts`  
Command (from `backend/`): `npx prisma db seed` or `npm run prisma:seed`

The seed **upserts**. You can run it again without duplicating the demo logins.

### What seed creates

| Item | What you get |
| --- | --- |
| Categories | 10 job categories |
| Admin | `admin@elevateworkforce.local` |
| Employers | `employer@elevateworkforce.local`, `health@elevateworkforce.local` |
| Seeker | `seeker@elevateworkforce.local` |
| Companies, jobs, applications | Demo vacancies and a few applications |

**Password for every seed user:** `Password@123`

| Role | Email |
| --- | --- |
| Admin | `admin@elevateworkforce.local` |
| Employer | `employer@elevateworkforce.local` |
| Employer (health) | `health@elevateworkforce.local` |
| Job seeker | `seeker@elevateworkforce.local` |

### Seed again (keep schema, refresh demo data)

```bash
cd backend
npx prisma db seed
```

### Un-seed / wipe the database, then seed again

Drops all tables, runs migrations, then seeds:

```bash
cd backend
npx prisma migrate reset
```

Type `y` when Prisma asks.

### Un-seed only (empty database, no seed users)

```bash
cd backend
npx prisma migrate reset --skip-seed
```

### Wipe Docker Postgres too

```bash
docker compose down -v
docker compose up -d
cd backend
npx prisma migrate deploy
npx prisma db seed
```

---

## 3. Frontend pages

Base URL: http://localhost:3001

| Page | URL | Who |
| --- | --- | --- |
| Home | `/` | Public |
| Jobs | `/jobs` | Public |
| Job detail | `/jobs/:id` | Public |
| Companies | `/companies` | Public |
| Company detail | `/companies/:id` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Forgot password | `/forgot-password` | Public |
| Reset password | `/reset-password` | Public |
| Seeker dashboard | `/seeker/dashboard` | Job seeker |
| My applications | `/seeker/applications` | Job seeker |
| Seeker profile | `/seeker/profile` | Job seeker |
| Employer dashboard | `/employer/dashboard` | Employer |
| My jobs | `/employer/jobs` | Employer |
| Create job | `/employer/jobs/create` | Employer |
| Edit job | `/employer/jobs/:id/edit` | Employer |
| Applicants | `/employer/applicants` | Employer |
| Company profile | `/employer/company` | Employer |
| Employer account | `/employer/account` | Employer |
| Admin dashboard | `/admin/dashboard` | Admin |
| Users | `/admin/users` | Admin |
| Companies | `/admin/companies` | Admin |
| Jobs | `/admin/jobs` | Admin |
| Applications | `/admin/applications` | Admin |
| Admin account | `/admin/account` | Admin |

The website calls `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`) with cookies.

---

## 4. API overview

Base URL: `http://localhost:4000`

| # | Module | Base path | Endpoints |
| ---: | --- | --- | ---: |
| 1 | Auth | `/api/auth` | 9 |
| 2 | Users | `/api/users` | 6 |
| 3 | Companies | `/api/companies` | 8 |
| 4 | Jobs | `/api/jobs` | 8 |
| 5 | Applications | `/api/applications` | 7 |
| 6 | Categories | `/api/categories` | 5 |
| 7 | Notifications | `/api/notifications` | 5 |
| 8 | Admin | `/api/admin` | 12 |
| 9 | Dashboard | `/api/dashboard` | 3 |
| 10 | Health | `/api/health` | 4 |
|  | **Total** |  | **67** |

Auth: HttpOnly cookie `access_token` (or `Authorization: Bearer <token>`).  
JSON body unless the row says **file**.

### Auth — `/api/auth` (9)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create seeker or employer |
| POST | `/api/auth/login` | Public | Login, set cookie |
| POST | `/api/auth/logout` | Logged in | Logout, blacklist token |
| POST | `/api/auth/logout-all` | Logged in | Invalidate all sessions |
| GET | `/api/auth/me` | Logged in | Current user |
| POST | `/api/auth/forgot-password` | Public | Email reset link (smtp4dev) |
| POST | `/api/auth/reset-password` | Public | Set new password from token |
| PATCH | `/api/auth/change-password` | Logged in | Change password |
| GET | `/api/auth/csrf` | Public | CSRF token (if enabled) |

### Users — `/api/users` (6)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| GET | `/api/users/me` | Logged in | Own profile |
| PATCH | `/api/users/me` | Logged in | Update name / profile |
| DELETE | `/api/users/me` | Logged in | Delete account |
| PATCH | `/api/users/me/avatar` | Logged in | Upload photo (**file**) |
| PATCH | `/api/users/me/resume` | Seeker | Upload PDF resume (**file**) |
| GET | `/api/users/:id` | Logged in | Public user card |

### Companies — `/api/companies` (8)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| GET | `/api/companies` | Public | List companies |
| GET | `/api/companies/:id` | Public | Company page |
| GET | `/api/companies/:id/jobs` | Public | Jobs for that company |
| GET | `/api/companies/me` | Employer | Own company |
| POST | `/api/companies` | Employer | Create company |
| PATCH | `/api/companies/me` | Employer | Update company |
| PATCH | `/api/companies/me/logo` | Employer | Upload logo (**file**) |
| DELETE | `/api/companies/me` | Employer | Delete company |

### Jobs — `/api/jobs` (8)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| GET | `/api/jobs` | Public | Paginated published jobs |
| GET | `/api/jobs/:id` | Public | Job detail |
| GET | `/api/jobs/my-jobs` | Employer, admin | Own jobs (all statuses) |
| GET | `/api/jobs/:id/statistics` | Employer, admin | Applicant counts |
| POST | `/api/jobs` | Employer, admin | Create job (default **DRAFT**) |
| PATCH | `/api/jobs/:id` | Employer, admin | Update job |
| PATCH | `/api/jobs/:id/status` | Employer, admin | DRAFT / PUBLISHED / CLOSED / ARCHIVED |
| DELETE | `/api/jobs/:id` | Employer, admin | Delete job |

Example: `GET /api/jobs?page=1&limit=10&search=developer&location=Kathmandu`

### Applications — `/api/applications` (7)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| POST | `/api/applications` | Seeker | Apply (`jobId`, optional cover letter) |
| GET | `/api/applications/my-applications` | Seeker | My applications |
| GET | `/api/applications/employer` | Employer, admin | Applicants for my jobs |
| GET | `/api/applications/job/:jobId` | Employer, admin | Applicants for one job |
| GET | `/api/applications/:id` | Owner / employer / admin | One application |
| PATCH | `/api/applications/:id/withdraw` | Seeker | Withdraw |
| PATCH | `/api/applications/:id/status` | Employer, admin | PENDING → REVIEWING → … |

A seeker may apply **once** per job (`jobId` + `applicantId` unique).

### Categories — `/api/categories` (5)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| GET | `/api/categories` | Public | List |
| GET | `/api/categories/:id` | Public | One category |
| POST | `/api/categories` | Admin | Create |
| PATCH | `/api/categories/:id` | Admin | Update |
| DELETE | `/api/categories/:id` | Admin | Delete |

### Notifications — `/api/notifications` (5)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| GET | `/api/notifications` | Logged in | Inbox |
| GET | `/api/notifications/unread-count` | Logged in | Unread count |
| PATCH | `/api/notifications/read-all` | Logged in | Mark all read |
| PATCH | `/api/notifications/:id/read` | Logged in | Mark one read |
| DELETE | `/api/notifications/:id` | Logged in | Delete |

### Admin — `/api/admin` (12)

All routes need an **admin** cookie.

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | Stats |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:id` | One user |
| PATCH | `/api/admin/users/:id/status` | ACTIVE / SUSPENDED / … |
| PATCH | `/api/admin/users/:id/role` | Change role |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/companies` | List companies |
| PATCH | `/api/admin/companies/:id/status` | PENDING / APPROVED / SUSPENDED |
| GET | `/api/admin/jobs` | All jobs |
| DELETE | `/api/admin/jobs/:id` | Delete job |
| GET | `/api/admin/applications` | All applications |
| GET | `/api/admin/reports` | Reports |

### Dashboard — `/api/dashboard` (3)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| GET | `/api/dashboard/seeker` | Seeker | Seeker home numbers |
| GET | `/api/dashboard/employer` | Employer | Employer home numbers |
| GET | `/api/dashboard/admin` | Admin | Admin home numbers |

### Health — `/api/health` (4)

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | API up |
| GET | `/api/health/database` | Public | Postgres check |
| GET | `/api/health/redis` | Public | Redis check |
| GET | `/api/health/services` | Public in dev, admin in production | Combined status |

---

## 5. Tests

```bash
cd backend && npm test
cd frontend && npm test
```

---

## 6. Layout

```
backend/     Express API, Prisma, tests/
frontend/    Next.js pages
docker-compose.yml
```

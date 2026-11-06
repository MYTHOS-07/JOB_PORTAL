# Elevate Workforce API

Express 5 TypeScript API on **port 4000**. MVC: routes → controllers → services → DAOs.

The full endpoint list (67 routes), seed accounts and start steps are in the **root [README.md](../README.md)**.

## Start

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Windows: `copy .env.example .env`

Do not commit `.env`.

## Seed / un-seed

| Command | Result |
| --- | --- |
| `npx prisma db seed` | Load demo users, jobs, applications |
| `npx prisma migrate reset` | Wipe DB, migrate, seed again |
| `npx prisma migrate reset --skip-seed` | Wipe DB, leave it empty |

Demo password: `Password@123`  
Logins: `admin@`, `employer@`, `seeker@` + `elevateworkforce.local`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Watch mode |
| `npm test` | Vitest in `tests/` |
| `npm run build` | Compile to `dist/` |
| `npm run prisma:seed` | Same as `npx prisma db seed` |

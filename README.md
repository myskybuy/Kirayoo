# Kirayo

Peer-to-peer rental marketplace for India (INR, Asia/Kolkata). Renters rent items from verified owners nearby; one admin reviews IDs, listings, disputes and payouts.

**Stack:** Next.js 16 (App Router, TypeScript, React 19) · PostgreSQL + Prisma 6 · design-kit CSS (no Tailwind) · email OTP auth (nodemailer) · Razorpay test mode or demo payments.

> Work in progress — see `PROGRESS.md`. Full README is written in Phase 9.

## Windows setup (short)

1. Node 20.9+.
2. Database — Kirayo uses its own Postgres container on **port 5437** (5432 = Dobara, 5433 = another local project):
   ```
   docker run --name kirayo-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kirayo -p 5437:5432 --restart unless-stopped -d postgres:16
   ```
3. `copy .env.example .env`
4. `npm install`
5. `npm run setup`
6. `npm run dev` → http://localhost:3001

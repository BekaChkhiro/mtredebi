# MTREDEBI - Project Context

## პროექტის შესახებ
Food delivery platform სამტრედიისთვის.
- ვადა: 2 თვე (8 კვირა)
- დეველოპერი: 1
- მიზანი: MVP გაშვება

## Tech Stack
- **Mobile:** React Native + Expo
- **Web:** Next.js 14
- **Backend:** Node.js + Express + Prisma
- **Database:** PostgreSQL (Railway)
- **Storage:** Cloudflare R2
- **Real-time:** Socket.io

## მიმდინარე სტატუსი
- **კვირა:** 1
- **დღე:** 1
- **ფაზა:** Setup & Infrastructure

## დღევანდელი პროგრესი
- [x] დოკუმენტაციის შექმნა
- [x] CLAUDE.md შექმნა
- [x] Monorepo setup (package.json, turbo.json)
- [x] Backend boilerplate (Express, Socket.io)
- [x] Prisma schema (ყველა მოდელი)
- [x] Shared package (types, constants, utils)
- [x] npm install
- [x] Railway PostgreSQL დაკავშირება
- [x] prisma db push - schema გაგზავნილია
- [x] სერვერი გაშვებულია (http://localhost:3001)

## შემდეგი სესიაზე
Auth API - ტელეფონით ავტორიზაცია (OTP)
1. auth.service.ts - OTP გენერაცია და შემოწმება
2. auth.controller.ts - route handlers
3. auth.routes.ts - endpoints
4. auth.middleware.ts - JWT verification

Endpoints:
- POST /api/v1/auth/send-otp
- POST /api/v1/auth/verify-otp
- GET /api/v1/auth/me

## ბოლო ცვლილებები
- 2025-01-03: პროექტის დაწყება, დოკუმენტაციის შექმნა
- 2025-01-03: Monorepo setup, Backend boilerplate, Prisma schema
- 2025-01-03: Database დაკავშირება, სერვერის გაშვება ✅

## მნიშვნელოვანი გადაწყვეტილებები
- PostgreSQL Railway-ზე (არა Supabase)
- Cloudflare R2 storage-ისთვის
- Monorepo Turborepo-ით

## ფაილების სტრუქტურა
```
mtredebi/
├── apps/
│   ├── customer/      # Customer mobile app
│   ├── driver/        # Driver mobile app
│   ├── restaurant/    # Restaurant web dashboard
│   └── admin/         # Admin web panel
├── packages/
│   ├── api/           # Backend API
│   └── shared/        # Shared types & utils
└── docs/              # Documentation
```

## კონტაქტი
Railway, Cloudflare, Twilio ანგარიშები საჭიროა deployment-ისთვის.

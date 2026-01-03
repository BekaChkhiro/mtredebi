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
- **დღე:** 2
- **ფაზა:** Backend API Development

## დღევანდელი პროგრესი
- [x] Auth API - ტელეფონით ავტორიზაცია (OTP)
  - auth.service.ts - OTP გენერაცია, ვერიფიკაცია, JWT
  - auth.controller.ts - route handlers + validation (Zod)
  - auth.routes.ts - endpoints
  - auth.middleware.ts - JWT verification, role-based access
- [x] ყველა endpoint დატესტილია და მუშაობს

## Auth API Endpoints
- `POST /api/v1/auth/send-otp` - OTP გაგზავნა (dev: console-ში)
- `POST /api/v1/auth/verify-otp` - OTP ვერიფიკაცია, JWT token
- `GET /api/v1/auth/me` - მიმდინარე მომხმარებელი (protected)
- `PUT /api/v1/auth/me` - პროფილის განახლება (protected)

## შემდეგი სესიაზე
Restaurant API
1. restaurant.service.ts - რესტორნების CRUD
2. restaurant.controller.ts - route handlers
3. restaurant.routes.ts - endpoints
4. menu.service.ts - მენიუს მართვა

Endpoints:
- GET /api/v1/restaurants - ყველა რესტორანი
- GET /api/v1/restaurants/:id - ერთი რესტორანი მენიუთი
- POST /api/v1/restaurant/menu - მენიუს დამატება (restaurant admin)

## ბოლო ცვლილებები
- 2025-01-03: პროექტის დაწყება, დოკუმენტაციის შექმნა
- 2025-01-03: Monorepo setup, Backend boilerplate, Prisma schema
- 2025-01-03: Database დაკავშირება, სერვერის გაშვება ✅
- 2026-01-03: Auth API დასრულებული ✅

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

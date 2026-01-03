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
- [x] Restaurant API - რესტორნები და მენიუ
  - restaurant.service.ts - CRUD + menu management
  - restaurant.controller.ts - route handlers + validation (Zod)
  - restaurant.routes.ts - public & restaurant dashboard endpoints
- [x] Order API - შეკვეთების მართვა
  - order.service.ts - CRUD, status transitions, validation
  - order.controller.ts - route handlers + validation (Zod)
  - order.routes.ts - customer & restaurant dashboard endpoints
- [x] ყველა endpoint დატესტილია და მუშაობს
- [x] Driver API - მძღოლის მართვა
  - driver.service.ts - status, location, order management
  - driver.controller.ts - route handlers + validation (Zod)
  - driver.routes.ts - driver endpoints

## Auth API Endpoints
- `POST /api/v1/auth/send-otp` - OTP გაგზავნა (dev: console-ში)
- `POST /api/v1/auth/verify-otp` - OTP ვერიფიკაცია, JWT token
- `GET /api/v1/auth/me` - მიმდინარე მომხმარებელი (protected)
- `PUT /api/v1/auth/me` - პროფილის განახლება (protected)

## Restaurant API Endpoints
Public:
- `GET /api/v1/restaurants` - ყველა რესტორანი (pagination, search)
- `GET /api/v1/restaurants/:id` - რესტორანი სრული მენიუთი

Restaurant Dashboard (protected - RESTAURANT_ADMIN):
- `POST /api/v1/restaurant/categories` - კატეგორიის დამატება
- `PUT /api/v1/restaurant/categories/:id` - კატეგორიის რედაქტირება
- `DELETE /api/v1/restaurant/categories/:id` - კატეგორიის წაშლა
- `POST /api/v1/restaurant/menu` - მენიუს item დამატება
- `PUT /api/v1/restaurant/menu/:id` - მენიუს item რედაქტირება
- `DELETE /api/v1/restaurant/menu/:id` - მენიუს item წაშლა

## Order API Endpoints
Customer (protected):
- `POST /api/v1/orders` - შეკვეთის შექმნა
- `GET /api/v1/orders` - მომხმარებლის შეკვეთები (pagination, status filter)
- `GET /api/v1/orders/:id` - კონკრეტული შეკვეთა
- `PUT /api/v1/orders/:id/cancel` - შეკვეთის გაუქმება (მხოლოდ PENDING)

Restaurant Dashboard (protected - RESTAURANT_ADMIN):
- `GET /api/v1/restaurant/orders` - რესტორნის შეკვეთები
- `PUT /api/v1/restaurant/orders/:id/status` - სტატუსის ცვლილება

Order Status Flow:
PENDING → ACCEPTED → PREPARING → READY → DRIVER_ASSIGNED → PICKED_UP → DELIVERING → DELIVERED
(ნებისმიერ ეტაპზე შესაძლებელია CANCELLED)

## Driver API Endpoints
Driver (protected - DRIVER):
- `PUT /api/v1/driver/status` - ონლაინ/ოფლაინ სტატუსი
- `PUT /api/v1/driver/location` - ლოკაციის განახლება
- `GET /api/v1/driver/orders` - ხელმისაწვდომი შეკვეთები (READY სტატუსით)
- `GET /api/v1/driver/orders/my` - მძღოლის აქტიური შეკვეთები
- `GET /api/v1/driver/orders/history` - შეკვეთების ისტორია
- `POST /api/v1/driver/orders/:id/accept` - შეკვეთის მიღება
- `PUT /api/v1/driver/orders/:id/picked-up` - შეკვეთა აიღო რესტორნიდან
- `PUT /api/v1/driver/orders/:id/delivering` - მიტანა დაიწყო
- `PUT /api/v1/driver/orders/:id/delivered` - მიტანილი

## შემდეგი სესიაზე
Socket.io Real-time Events
1. socket/index.ts - connection handling
2. Order status updates broadcasting
3. Driver location updates
4. New order notifications for restaurants

## ბოლო ცვლილებები
- 2025-01-03: პროექტის დაწყება, დოკუმენტაციის შექმნა
- 2025-01-03: Monorepo setup, Backend boilerplate, Prisma schema
- 2025-01-03: Database დაკავშირება, სერვერის გაშვება ✅
- 2026-01-03: Auth API დასრულებული ✅
- 2026-01-03: Restaurant API დასრულებული ✅
- 2026-01-03: Order API დასრულებული ✅
- 2026-01-03: Driver API დასრულებული ✅

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

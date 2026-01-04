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
- **დღე:** 4
- **ფაზა:** Customer Mobile App Development 🚧 (მიმდინარე)

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
- [x] Socket.io Real-time Events
  - socket/index.ts - JWT auth, room management, event handlers
  - Order status updates broadcasting
  - Driver location updates (real-time)
  - New order notifications for restaurants
  - Driver assignment notifications
- [x] Image Upload (Cloudflare R2)
  - upload.service.ts - R2 client, upload/delete operations
  - upload.middleware.ts - multer config, file validation
  - Restaurant image upload endpoints (image, cover)
  - Menu item image upload endpoint
- [x] Admin API - ადმინისტრირება
  - admin.service.ts - dashboard stats, CRUD operations, analytics
  - admin.controller.ts - route handlers + validation (Zod)
  - admin.routes.ts - admin panel endpoints

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
- `POST /api/v1/restaurant/upload/image` - რესტორნის სურათის ატვირთვა
- `POST /api/v1/restaurant/upload/cover` - რესტორნის cover სურათის ატვირთვა
- `POST /api/v1/restaurant/menu/:id/upload` - მენიუს item სურათის ატვირთვა

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

## Socket.io Events

Connection:
- `connect` with `auth: { token }` - JWT authentication
- Auto-join rooms based on role (customer, driver, restaurant)

Client Events (emit):
- `join:order` (orderId) - შეკვეთის ოთახში შესვლა tracking-ისთვის
- `leave:order` (orderId) - შეკვეთის ოთახიდან გასვლა
- `driver:location` ({ lat, lng, orderId? }) - მძღოლის ლოკაციის განახლება
- `track:driver` (driverId) - მძღოლის tracking-ის დაწყება
- `untrack:driver` (driverId) - მძღოლის tracking-ის შეწყვეტა

Server Events (listen):
- `order:new` - ახალი შეკვეთა (რესტორანი)
- `order:updated` - შეკვეთის სტატუსის ცვლილება
- `order:ready` - შეკვეთა მზადაა (მძღოლები)
- `driver:assigned` - მძღოლი მიენიჭა შეკვეთას
- `driver:location` - მძღოლის ლოკაცია (tracking)

Rooms:
- `customer:{userId}` - კლიენტის პირადი ოთახი
- `restaurant:{restaurantId}` - რესტორნის ოთახი
- `driver:{userId}` - მძღოლის პირადი ოთახი
- `drivers` - ყველა online მძღოლი
- `order:{orderId}` - კონკრეტული შეკვეთის ოთახი
- `driver:{driverId}:tracking` - მძღოლის tracking subscribers

## Admin API Endpoints
Admin (protected - ADMIN):

Dashboard:
- `GET /api/v1/admin/dashboard` - სტატისტიკა (users, orders, revenue)

User Management:
- `GET /api/v1/admin/users` - მომხმარებლების სია (pagination, role filter, search)
- `GET /api/v1/admin/users/:id` - კონკრეტული მომხმარებელი
- `PUT /api/v1/admin/users/:id` - მომხმარებლის რედაქტირება (role, status)

Restaurant Management:
- `GET /api/v1/admin/restaurants` - რესტორნების სია (pagination, search)
- `POST /api/v1/admin/restaurants` - ახალი რესტორანი
- `PUT /api/v1/admin/restaurants/:id` - რესტორნის რედაქტირება
- `DELETE /api/v1/admin/restaurants/:id` - რესტორნის წაშლა

Driver Management:
- `GET /api/v1/admin/drivers` - მძღოლების სია (pagination, filters)
- `POST /api/v1/admin/drivers` - ახალი მძღოლი
- `PUT /api/v1/admin/drivers/:id` - მძღოლის რედაქტირება

Order Management:
- `GET /api/v1/admin/orders` - შეკვეთების სია (pagination, filters)

Analytics:
- `GET /api/v1/admin/analytics/revenue` - შემოსავლის ანალიტიკა (date range)
- `GET /api/v1/admin/analytics/orders` - შეკვეთების ანალიტიკა (by status, by hour)
- `GET /api/v1/admin/analytics/top-restaurants` - ტოპ რესტორნები

## Customer Mobile App (apps/customer/)
React Native + Expo customer app. Tech Stack:
- **Navigation:** Expo Router (file-based)
- **State:** Zustand + React Query
- **Styling:** NativeWind (Tailwind CSS)
- **Real-time:** Socket.io-client

### შექმნილი Screens:
- `app/(auth)/phone.tsx` - ტელეფონის შეყვანა
- `app/(auth)/otp.tsx` - OTP ვერიფიკაცია
- `app/(tabs)/index.tsx` - მთავარი (რესტორნები)
- `app/(tabs)/orders.tsx` - შეკვეთების ისტორია
- `app/(tabs)/profile.tsx` - პროფილი
- `app/restaurant/[id].tsx` - რესტორნის მენიუ
- `app/cart.tsx` - კალათა
- `app/checkout.tsx` - შეკვეთის გაფორმება
- `app/order/[id].tsx` - შეკვეთის თვალყურისდევნება

### შექმნილი Stores & Hooks:
- `src/store/auth.store.ts` - JWT + User state
- `src/store/cart.store.ts` - Cart management
- `src/api/` - API client + endpoints
- `src/hooks/` - React Query hooks

### გაშვება:
```bash
cd apps/customer && npm run dev
```

## შემდეგი სესიაზე
Customer App-ის დარჩენილი ნაბიჯები:
1. Socket.io real-time integration
2. Driver location tracking on map
3. Push notifications setup

შემდეგი apps:
1. Restaurant Dashboard (Next.js)
2. Driver Mobile App (React Native + Expo)
3. Admin Panel (Next.js)

## ბოლო ცვლილებები
- 2025-01-03: პროექტის დაწყება, დოკუმენტაციის შექმნა
- 2025-01-03: Monorepo setup, Backend boilerplate, Prisma schema
- 2025-01-03: Database დაკავშირება, სერვერის გაშვება ✅
- 2026-01-03: Auth API დასრულებული ✅
- 2026-01-03: Restaurant API დასრულებული ✅
- 2026-01-03: Order API დასრულებული ✅
- 2026-01-03: Driver API დასრულებული ✅
- 2026-01-03: Socket.io Real-time Events დასრულებული ✅
- 2026-01-03: Image Upload (Cloudflare R2) დასრულებული ✅
- 2026-01-03: Admin API დასრულებული ✅
- 2026-01-04: Customer Mobile App - project setup, screens, stores 🚧

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

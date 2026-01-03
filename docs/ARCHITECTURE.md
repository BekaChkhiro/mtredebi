# MTREDEBI - არქიტექტურა

## Monorepo სტრუქტურა

```
mtredebi/
├── docs/                          # დოკუმენტაცია
│   ├── index.html                 # ვიზუალური Dashboard
│   ├── OVERVIEW.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── WEEKLY_PLAN.md
│   └── TECH_STACK.md
│
├── apps/
│   ├── customer/                  # Customer Mobile App
│   │   ├── src/
│   │   │   ├── components/        # UI კომპონენტები
│   │   │   ├── screens/           # ეკრანები
│   │   │   ├── navigation/        # ნავიგაცია
│   │   │   ├── services/          # API calls
│   │   │   ├── store/             # State management
│   │   │   ├── hooks/             # Custom hooks
│   │   │   ├── utils/             # Helper functions
│   │   │   └── constants/         # Constants
│   │   ├── assets/                # Images, fonts
│   │   ├── app.json
│   │   └── package.json
│   │
│   ├── driver/                    # Driver Mobile App
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── navigation/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── constants/
│   │   ├── assets/
│   │   ├── app.json
│   │   └── package.json
│   │
│   ├── restaurant/                # Restaurant Web Dashboard
│   │   ├── src/
│   │   │   ├── app/               # Next.js App Router
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── admin/                     # Admin Web Panel
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── lib/
│       │   └── styles/
│       ├── public/
│       └── package.json
│
├── packages/
│   ├── api/                       # Backend API
│   │   ├── src/
│   │   │   ├── controllers/       # Route handlers
│   │   │   ├── models/            # Database models
│   │   │   ├── routes/            # API routes
│   │   │   ├── middleware/        # Auth, validation
│   │   │   ├── services/          # Business logic
│   │   │   ├── utils/             # Helpers
│   │   │   ├── config/            # Configuration
│   │   │   └── socket/            # Socket.io handlers
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Database schema
│   │   └── package.json
│   │
│   └── shared/                    # Shared code
│       ├── types/                 # TypeScript types
│       ├── constants/             # Shared constants
│       ├── utils/                 # Shared utilities
│       └── package.json
│
├── package.json                   # Root package.json
├── turbo.json                     # Turborepo config
├── .gitignore
├── .env.example
└── README.md
```

---

## არქიტექტურის დიაგრამა

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Customer    │  │   Driver     │  │  Restaurant  │          │
│  │  App (RN)    │  │   App (RN)   │  │  Web (Next)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│  ┌──────┴─────────────────┴─────────────────┴───────┐          │
│  │              Admin Panel (Next.js)               │          │
│  └──────────────────────┬───────────────────────────┘          │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Node.js + Express API                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │  Auth   │ │ Orders  │ │  Menu   │ │ Location│       │   │
│  │  │ Routes  │ │ Routes  │ │ Routes  │ │ Routes  │       │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│  │       └───────────┴───────────┴───────────┘             │   │
│  │                        │                                 │   │
│  │  ┌─────────────────────┴─────────────────────┐          │   │
│  │  │            Socket.io Server               │          │   │
│  │  │     (Real-time location & updates)        │          │   │
│  │  └───────────────────────────────────────────┘          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │ Cloudflare   │          │
│  │  (Railway)   │  │   (Cache)    │  │     R2       │          │
│  │              │  │              │  │   (Images)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Google Maps  │  │   Twilio     │  │   Firebase   │          │
│  │   (Maps)     │  │   (SMS)      │  │    (FCM)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## მონაცემთა ნაკადი

### 1. შეკვეთის გაფორმება

```
Customer App                API                  Restaurant Dashboard
     │                       │                          │
     │  POST /orders         │                          │
     │──────────────────────>│                          │
     │                       │   Socket: new_order      │
     │                       │─────────────────────────>│
     │                       │                          │
     │   { orderId, status } │                          │
     │<──────────────────────│                          │
     │                       │                          │
```

### 2. შეკვეთის მიღება რესტორნის მიერ

```
Restaurant Dashboard        API                  Customer App
     │                       │                          │
     │  PATCH /orders/:id    │                          │
     │  { status: accepted } │                          │
     │──────────────────────>│                          │
     │                       │  Socket: order_updated   │
     │                       │─────────────────────────>│
     │                       │                          │
```

### 3. კურიერის რეალ-ტაიმ ლოკაცია

```
Driver App                  Socket.io Server          Customer App
     │                            │                        │
     │  emit: location_update     │                        │
     │  { lat, lng, orderId }     │                        │
     │───────────────────────────>│                        │
     │                            │  emit: driver_location │
     │                            │  { lat, lng }          │
     │                            │───────────────────────>│
     │                            │                        │
```

---

## უსაფრთხოება

### Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Client    │     │     API      │     │   Twilio     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  POST /auth/send   │                    │
       │  { phone }         │                    │
       │───────────────────>│                    │
       │                    │   Send SMS OTP     │
       │                    │───────────────────>│
       │                    │                    │
       │   { success }      │                    │
       │<───────────────────│                    │
       │                    │                    │
       │  POST /auth/verify │                    │
       │  { phone, otp }    │                    │
       │───────────────────>│                    │
       │                    │                    │
       │  { token, user }   │                    │
       │<───────────────────│                    │
       │                    │                    │
```

### JWT Token Structure

```javascript
{
  "userId": "uuid",
  "role": "customer" | "driver" | "restaurant" | "admin",
  "exp": 1234567890,
  "iat": 1234567890
}
```

---

## Environment Variables

```env
# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Twilio (SMS)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Google Maps
GOOGLE_MAPS_API_KEY=...

# Cloudflare R2
R2_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=mtredebi-bucket
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Firebase (FCM)
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

# MTREDEBI - ტექნოლოგიების სტეკი

## მიმოხილვა

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
├─────────────────────────────────────────────────────────────┤
│  Mobile: React Native + Expo                                │
│  Web: Next.js 14 + Tailwind CSS                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                                │
├─────────────────────────────────────────────────────────────┤
│  Runtime: Node.js                                           │
│  Framework: Express.js                                      │
│  ORM: Prisma                                                │
│  Real-time: Socket.io                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE & STORAGE                      │
├─────────────────────────────────────────────────────────────┤
│  Primary: PostgreSQL (Railway)                              │
│  Cache: Redis (optional)                                    │
│  Storage: Cloudflare R2 (S3-compatible)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile Apps

### React Native + Expo

| Package | Version | გამოყენება |
|---------|---------|------------|
| expo | ~50.0.0 | Framework |
| react-native | 0.73.x | Core |
| expo-router | ~3.4.0 | Navigation |
| @react-navigation/native | ^6.x | Navigation |
| zustand | ^4.x | State Management |
| @tanstack/react-query | ^5.x | Data Fetching |
| axios | ^1.x | HTTP Client |
| socket.io-client | ^4.x | Real-time |
| react-native-maps | ^1.x | Maps |
| expo-location | ~16.x | Geolocation |
| expo-secure-store | ~12.x | Secure Storage |
| nativewind | ^2.x | Styling (Tailwind) |

### რატომ Expo?
- ✅ სწრაფი development
- ✅ OTA updates
- ✅ Easy build process
- ✅ კარგი დოკუმენტაცია

---

## 🖥️ Web Apps

### Next.js 14

| Package | Version | გამოყენება |
|---------|---------|------------|
| next | ^14.x | Framework |
| react | ^18.x | UI Library |
| tailwindcss | ^3.x | Styling |
| shadcn/ui | latest | UI Components |
| @tanstack/react-query | ^5.x | Data Fetching |
| axios | ^1.x | HTTP Client |
| socket.io-client | ^4.x | Real-time |
| react-hook-form | ^7.x | Forms |
| zod | ^3.x | Validation |
| zustand | ^4.x | State Management |
| lucide-react | latest | Icons |

### რატომ Next.js?
- ✅ Server-side rendering
- ✅ API routes (optional)
- ✅ Great DX
- ✅ Vercel deployment

---

## ⚙️ Backend

### Node.js + Express

| Package | Version | გამოყენება |
|---------|---------|------------|
| express | ^4.x | Web Framework |
| prisma | ^5.x | ORM |
| @prisma/client | ^5.x | Database Client |
| socket.io | ^4.x | Real-time |
| jsonwebtoken | ^9.x | JWT Auth |
| bcryptjs | ^2.x | Password Hashing |
| cors | ^2.x | CORS |
| helmet | ^7.x | Security |
| express-rate-limit | ^7.x | Rate Limiting |
| zod | ^3.x | Validation |
| dotenv | ^16.x | Environment |
| morgan | ^1.x | Logging |
| multer | ^1.x | File Upload |

### Folder Structure
```
packages/api/
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app
│   ├── config/
│   │   └── index.ts          # Configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── restaurant.controller.ts
│   │   ├── order.controller.ts
│   │   └── driver.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── restaurant.routes.ts
│   │   ├── order.routes.ts
│   │   └── driver.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── sms.service.ts
│   │   └── order.service.ts
│   ├── socket/
│   │   └── index.ts
│   └── utils/
│       ├── jwt.ts
│       └── helpers.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── package.json
```

---

## 🗄️ Database

### PostgreSQL (Railway)

**რატომ Railway?**
- ✅ Backend და DB ერთ ადგილას
- ✅ მარტივი setup და მართვა
- ✅ არ არის vendor lock-in
- ✅ კარგი performance
- ✅ ავტომატური backups
- ✅ $5/თვეში 1GB storage

### Prisma ORM

**რატომ Prisma?**
- ✅ Type-safe queries
- ✅ Auto-generated types
- ✅ Migrations
- ✅ Great DX

---

## 📦 Storage

### Cloudflare R2

**რატომ R2?**
- ✅ **Egress (download) უფასოა!**
- ✅ S3-compatible API
- ✅ ჩაშენებული CDN
- ✅ $0.015/GB/თვეში storage
- ✅ სწრაფი გლობალურად

**გამოყენება:**
- 📸 რესტორნების ფოტოები
- 🍔 მენიუს ფოტოები
- 👤 მომხმარებლების ავატარები

**Implementation:**
```typescript
// services/storage.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadImage = async (
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
};
```

**Bucket Structure:**
```
mtredebi-bucket/
├── restaurants/
│   ├── {restaurant_id}/
│   │   ├── logo.webp
│   │   └── cover.webp
├── menu-items/
│   └── {item_id}.webp
└── users/
    └── {user_id}/
        └── avatar.webp
```

---

## 🔴 Real-time

### Socket.io

**გამოყენება:**
- კურიერის ლოკაციის განახლება
- შეკვეთის სტატუსის განახლება
- ახალი შეკვეთის ნოტიფიკაცია

**Events:**
```javascript
// Server -> Client
'order:updated'      // შეკვეთის სტატუსი შეიცვალა
'driver:location'    // კურიერის ლოკაცია განახლდა
'order:new'          // ახალი შეკვეთა (restaurant/driver)

// Client -> Server
'location:update'    // კურიერი აგზავნის ლოკაციას
'join:order'         // შეკვეთის room-ში შესვლა
'leave:order'        // შეკვეთის room-იდან გასვლა
```

---

## 🗺️ Maps

### Google Maps

| Platform | Package |
|----------|---------|
| Mobile | react-native-maps |
| Web | @react-google-maps/api |

**Features:**
- რესტორნების ჩვენება რუკაზე
- კურიერის ლოკაციის თრექინგი
- მარშრუტის ჩვენება
- Geocoding (მისამართი -> კოორდინატები)

---

## 📨 SMS

### Twilio (ან ლოკალური)

**ლოკალური ალტერნატივები:**
- Magti SMS API
- Geocell SMS API
- Silknet SMS API

**Implementation:**
```typescript
// services/sms.service.ts
export const sendOTP = async (phone: string, code: string) => {
  // Twilio
  await twilioClient.messages.create({
    body: `MTREDEBI: თქვენი კოდია ${code}`,
    from: TWILIO_PHONE,
    to: phone
  });
};
```

---

## ☁️ Hosting & Deployment

### Backend + Database: Railway

| Service | Plan | Price |
|---------|------|-------|
| Backend (Node.js) | Hobby | ~$5/month |
| PostgreSQL | Hobby | ~$5/month |
| **Total** | | **~$10/month** |

**რატომ Railway?**
- ✅ Backend და DB ერთ ადგილას
- ✅ მარტივი deployment (Git push)
- ✅ არ იძინებს
- ✅ ავტომატური SSL
- ✅ Easy scaling

### Web: Vercel

| Plan | Price | Features |
|------|-------|----------|
| Hobby | Free | 100GB bandwidth |
| Pro | $20/month | More resources |

### Storage: Cloudflare R2

| Resource | Price |
|----------|-------|
| Storage | $0.015/GB/month |
| Class A ops (write) | $4.50/million |
| Class B ops (read) | $0.36/million |
| **Egress** | **უფასო!** |

**შენიშვნა:** პირველი 10GB/თვეში უფასოა!

---

## 🔧 Development Tools

### Code Quality

```json
{
  "devDependencies": {
    "typescript": "^5.x",
    "eslint": "^8.x",
    "prettier": "^3.x",
    "@types/node": "^20.x",
    "@types/express": "^4.x"
  }
}
```

### Monorepo

| Tool | Purpose |
|------|---------|
| Turborepo | Build system |
| pnpm | Package manager |

### Testing (Phase 2)

| Tool | Purpose |
|------|---------|
| Jest | Unit tests |
| Supertest | API tests |
| Detox | E2E mobile tests |

---

## 📊 Monitoring (Phase 2)

| Service | Purpose |
|---------|---------|
| Sentry | Error tracking |
| Vercel Analytics | Web analytics |
| Expo Updates | OTA updates |

---

## 💰 ხარჯების შეფასება (თვიური)

### MVP Phase

| Service | Cost |
|---------|------|
| Railway (Backend) | ~$5 |
| Railway (PostgreSQL) | ~$5 |
| Cloudflare R2 | $0 (free tier: 10GB) |
| Vercel (Web) | $0 (free tier) |
| Twilio (SMS) | ~$10-20 |
| Google Maps | ~$0-10 |
| **Total** | **~$20-40/month** |

### Scale Phase

| Service | Cost |
|---------|------|
| Railway (Backend) | $20+ |
| Railway (PostgreSQL) | $20+ |
| Cloudflare R2 | ~$5-10 |
| Vercel Pro | $20 |
| Twilio | $50+ |
| Google Maps | $50+ |
| **Total** | **~$165+/month** |

### უპირატესობა Supabase-თან შედარებით

| | Railway + R2 | Supabase |
|---|---|---|
| Egress costs | ✅ უფასო (R2) | 💰 ფასიანი |
| Vendor lock-in | ✅ არ არის | ⚠️ არის |
| Flexibility | ✅ მაღალი | ⚠️ შეზღუდული |

---

## Version Control

### Git Branching

```
main (production)
  └── develop
        ├── feature/auth
        ├── feature/orders
        └── fix/bug-name
```

### Commit Convention

```
feat: add user authentication
fix: resolve order status bug
docs: update API documentation
refactor: improve database queries
style: format code
```

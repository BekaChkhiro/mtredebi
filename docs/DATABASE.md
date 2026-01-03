# MTREDEBI - მონაცემთა ბაზის სქემა

## ER დიაგრამა

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │  restaurants │       │   drivers    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ phone        │       │ name         │       │ user_id (FK) │
│ name         │       │ description  │       │ vehicle_type │
│ role         │       │ address      │       │ is_online    │
│ avatar_url   │       │ lat/lng      │       │ current_lat  │
│ created_at   │       │ image_url    │       │ current_lng  │
└──────┬───────┘       │ is_active    │       │ is_available │
       │               │ opening_hours│       └──────┬───────┘
       │               └──────┬───────┘              │
       │                      │                      │
       │               ┌──────┴───────┐              │
       │               │  categories  │              │
       │               ├──────────────┤              │
       │               │ id           │              │
       │               │ restaurant_id│              │
       │               │ name         │              │
       │               │ sort_order   │              │
       │               └──────┬───────┘              │
       │                      │                      │
       │               ┌──────┴───────┐              │
       │               │  menu_items  │              │
       │               ├──────────────┤              │
       │               │ id           │              │
       │               │ category_id  │              │
       │               │ name         │              │
       │               │ description  │              │
       │               │ price        │              │
       │               │ image_url    │              │
       │               │ is_available │              │
       │               └──────────────┘              │
       │                                             │
       │               ┌──────────────┐              │
       └──────────────>│    orders    │<─────────────┘
                       ├──────────────┤
                       │ id           │
                       │ customer_id  │
                       │ restaurant_id│
                       │ driver_id    │
                       │ status       │
                       │ total_amount │
                       │ delivery_fee │
                       │ address      │
                       │ lat/lng      │
                       │ notes        │
                       │ created_at   │
                       └──────┬───────┘
                              │
                       ┌──────┴───────┐
                       │ order_items  │
                       ├──────────────┤
                       │ id           │
                       │ order_id     │
                       │ menu_item_id │
                       │ quantity     │
                       │ price        │
                       │ notes        │
                       └──────────────┘
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USERS ====================

model User {
  id          String    @id @default(uuid())
  phone       String    @unique
  name        String?
  avatarUrl   String?   @map("avatar_url")
  role        UserRole  @default(CUSTOMER)
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  driver      Driver?
  orders      Order[]   @relation("CustomerOrders")
  addresses   Address[]

  @@map("users")
}

enum UserRole {
  CUSTOMER
  DRIVER
  RESTAURANT_ADMIN
  ADMIN
}

model Address {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  label     String   // "სახლი", "ოფისი", "სხვა"
  address   String
  lat       Float
  lng       Float
  isDefault Boolean  @default(false) @map("is_default")
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("addresses")
}

// ==================== DRIVERS ====================

model Driver {
  id           String      @id @default(uuid())
  userId       String      @unique @map("user_id")
  vehicleType  VehicleType @map("vehicle_type")
  isOnline     Boolean     @default(false) @map("is_online")
  isAvailable  Boolean     @default(true) @map("is_available")
  currentLat   Float?      @map("current_lat")
  currentLng   Float?      @map("current_lng")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  // Relations
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders       Order[]

  @@map("drivers")
}

enum VehicleType {
  WALKING
  BICYCLE
  SCOOTER
  CAR
}

// ==================== RESTAURANTS ====================

model Restaurant {
  id            String    @id @default(uuid())
  name          String
  description   String?
  address       String
  lat           Float
  lng           Float
  phone         String
  imageUrl      String?   @map("image_url")
  coverImageUrl String?   @map("cover_image_url")
  isActive      Boolean   @default(true) @map("is_active")
  minOrderAmount Float    @default(0) @map("min_order_amount")
  deliveryFee   Float     @default(0) @map("delivery_fee")
  avgPrepTime   Int       @default(30) @map("avg_prep_time") // minutes
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  categories    Category[]
  orders        Order[]
  workingHours  WorkingHours[]

  @@map("restaurants")
}

model WorkingHours {
  id           String     @id @default(uuid())
  restaurantId String     @map("restaurant_id")
  dayOfWeek    Int        @map("day_of_week") // 0 = Sunday, 6 = Saturday
  openTime     String     @map("open_time")   // "09:00"
  closeTime    String     @map("close_time")  // "22:00"
  isClosed     Boolean    @default(false) @map("is_closed")

  // Relations
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@unique([restaurantId, dayOfWeek])
  @@map("working_hours")
}

// ==================== MENU ====================

model Category {
  id           String     @id @default(uuid())
  restaurantId String     @map("restaurant_id")
  name         String
  sortOrder    Int        @default(0) @map("sort_order")
  isActive     Boolean    @default(true) @map("is_active")
  createdAt    DateTime   @default(now()) @map("created_at")

  // Relations
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  menuItems    MenuItem[]

  @@map("categories")
}

model MenuItem {
  id          String      @id @default(uuid())
  categoryId  String      @map("category_id")
  name        String
  description String?
  price       Float
  imageUrl    String?     @map("image_url")
  isAvailable Boolean     @default(true) @map("is_available")
  sortOrder   Int         @default(0) @map("sort_order")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  // Relations
  category    Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  orderItems  OrderItem[]

  @@map("menu_items")
}

// ==================== ORDERS ====================

model Order {
  id              String      @id @default(uuid())
  orderNumber     String      @unique @map("order_number") // MTR-001
  customerId      String      @map("customer_id")
  restaurantId    String      @map("restaurant_id")
  driverId        String?     @map("driver_id")
  status          OrderStatus @default(PENDING)

  // Amounts
  subtotal        Float
  deliveryFee     Float       @map("delivery_fee")
  totalAmount     Float       @map("total_amount")

  // Delivery info
  deliveryAddress String      @map("delivery_address")
  deliveryLat     Float       @map("delivery_lat")
  deliveryLng     Float       @map("delivery_lng")

  // Notes
  customerNotes   String?     @map("customer_notes")

  // Timestamps
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  acceptedAt      DateTime?   @map("accepted_at")
  preparingAt     DateTime?   @map("preparing_at")
  readyAt         DateTime?   @map("ready_at")
  pickedUpAt      DateTime?   @map("picked_up_at")
  deliveredAt     DateTime?   @map("delivered_at")
  cancelledAt     DateTime?   @map("cancelled_at")

  // Relations
  customer        User        @relation("CustomerOrders", fields: [customerId], references: [id])
  restaurant      Restaurant  @relation(fields: [restaurantId], references: [id])
  driver          Driver?     @relation(fields: [driverId], references: [id])
  items           OrderItem[]

  @@map("orders")
}

enum OrderStatus {
  PENDING           // შეკვეთა გაგზავნილია
  ACCEPTED          // რესტორანმა მიიღო
  PREPARING         // მზადდება
  READY             // მზადაა
  DRIVER_ASSIGNED   // კურიერი დაინიშნა
  PICKED_UP         // კურიერმა აიღო
  DELIVERING        // მიმდინარეობს მიწოდება
  DELIVERED         // მიწოდებულია
  CANCELLED         // გაუქმებულია
}

model OrderItem {
  id         String   @id @default(uuid())
  orderId    String   @map("order_id")
  menuItemId String   @map("menu_item_id")
  name       String   // Snapshot of menu item name
  price      Float    // Snapshot of price at order time
  quantity   Int
  notes      String?
  createdAt  DateTime @default(now()) @map("created_at")

  // Relations
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])

  @@map("order_items")
}

// ==================== OTP ====================

model OTP {
  id        String   @id @default(uuid())
  phone     String
  code      String
  expiresAt DateTime @map("expires_at")
  isUsed    Boolean  @default(false) @map("is_used")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("otps")
}
```

---

## ინდექსები (Performance)

```sql
-- ხშირი queries-ისთვის
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);

CREATE INDEX idx_drivers_is_online ON drivers(is_online);
CREATE INDEX idx_drivers_is_available ON drivers(is_available);

CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);

CREATE INDEX idx_otps_phone_code ON otps(phone, code);
```

---

## შეკვეთის სტატუსების ნაკადი

```
PENDING ──> ACCEPTED ──> PREPARING ──> READY ──> DRIVER_ASSIGNED ──> PICKED_UP ──> DELIVERING ──> DELIVERED
    │           │            │           │              │                │             │
    └───────────┴────────────┴───────────┴──────────────┴────────────────┴─────────────┘
                                         │
                                         ▼
                                    CANCELLED
```

---

## Sample Queries

### 1. მომხმარებლის აქტიური შეკვეთა

```sql
SELECT o.*, r.name as restaurant_name, d.current_lat, d.current_lng
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
LEFT JOIN drivers d ON o.driver_id = d.id
WHERE o.customer_id = $1
  AND o.status NOT IN ('DELIVERED', 'CANCELLED')
ORDER BY o.created_at DESC
LIMIT 1;
```

### 2. რესტორნის ახალი შეკვეთები

```sql
SELECT o.*, u.name as customer_name, u.phone as customer_phone
FROM orders o
JOIN users u ON o.customer_id = u.id
WHERE o.restaurant_id = $1
  AND o.status = 'PENDING'
ORDER BY o.created_at ASC;
```

### 3. ხელმისაწვდომი კურიერები

```sql
SELECT d.*, u.name, u.phone
FROM drivers d
JOIN users u ON d.user_id = u.id
WHERE d.is_online = true
  AND d.is_available = true
  AND ST_DWithin(
    ST_MakePoint(d.current_lng, d.current_lat)::geography,
    ST_MakePoint($1, $2)::geography,
    5000 -- 5km radius
  )
ORDER BY ST_Distance(
  ST_MakePoint(d.current_lng, d.current_lat)::geography,
  ST_MakePoint($1, $2)::geography
);
```

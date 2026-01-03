# MTREDEBI - კვირების გეგმა (8 კვირა)

## მიმოხილვა

| კვირა | ფოკუსი | შედეგი |
|-------|--------|--------|
| 1 | Setup & Database | პროექტის სტრუქტურა + DB |
| 2 | Auth & Core APIs | ავტორიზაცია + ძირითადი API |
| 3 | Customer App (Part 1) | რესტორნები + მენიუ |
| 4 | Customer App (Part 2) | შეკვეთა + თრექინგი |
| 5 | Driver App | კურიერის აპლიკაცია |
| 6 | Restaurant Dashboard | რესტორნის პანელი |
| 7 | Admin Panel | ადმინის პანელი |
| 8 | Testing & Deployment | ტესტირება + გაშვება |

---

## კვირა 1: Setup & Database

### მიზანი
პროექტის ინფრასტრუქტურის მომზადება

### დავალებები

- [ ] **Monorepo Setup**
  - [ ] Root package.json და Turborepo კონფიგურაცია
  - [ ] apps/ და packages/ ფოლდერების შექმნა
  - [ ] Shared types package

- [ ] **Backend Setup**
  - [ ] Express.js სერვერი
  - [ ] Prisma ORM setup
  - [ ] Database schema მიგრაცია
  - [ ] .env კონფიგურაცია

- [ ] **Database**
  - [ ] Supabase პროექტის შექმნა
  - [ ] PostgreSQL კავშირი
  - [ ] Seed data (სატესტო მონაცემები)

- [ ] **DevOps Basics**
  - [ ] Git repository
  - [ ] .gitignore
  - [ ] ESLint + Prettier
  - [ ] Environment variables

### შედეგი
✅ პროექტის სტრუქტურა მზადაა, DB დაკავშირებულია

---

## კვირა 2: Authentication & Core APIs

### მიზანი
ავტორიზაციის სისტემა და ძირითადი API endpoints

### დავალებები

- [ ] **Authentication**
  - [ ] SMS OTP გაგზავნა (Twilio/local)
  - [ ] OTP ვერიფიკაცია
  - [ ] JWT token გენერაცია
  - [ ] Auth middleware
  - [ ] Role-based access control

- [ ] **Restaurant APIs**
  - [ ] GET /restaurants (list)
  - [ ] GET /restaurants/:id (details + menu)
  - [ ] Search & filter

- [ ] **Menu APIs**
  - [ ] GET /categories
  - [ ] GET /menu-items

- [ ] **Testing**
  - [ ] Postman collection
  - [ ] API ტესტირება

### შედეგი
✅ ავტორიზაცია მუშაობს, რესტორნების API მზადაა

---

## კვირა 3: Customer App (Part 1)

### მიზანი
მომხმარებლის აპის ძირითადი ეკრანები

### დავალებები

- [ ] **Expo Setup**
  - [ ] React Native + Expo პროექტი
  - [ ] Navigation setup (React Navigation)
  - [ ] UI library (NativeWind / Tamagui)

- [ ] **Auth Screens**
  - [ ] Splash Screen
  - [ ] Phone Input Screen
  - [ ] OTP Verification Screen
  - [ ] Profile Setup Screen

- [ ] **Home Screen**
  - [ ] Header (location, search)
  - [ ] Restaurant list
  - [ ] Categories
  - [ ] Pull to refresh

- [ ] **Restaurant Screen**
  - [ ] Restaurant header (image, info)
  - [ ] Menu categories tabs
  - [ ] Menu items list
  - [ ] Item detail modal

- [ ] **State Management**
  - [ ] Zustand setup
  - [ ] Auth store
  - [ ] Cart store

### შედეგი
✅ მომხმარებელს შეუძლია რეგისტრაცია და მენიუს ნახვა

---

## კვირა 4: Customer App (Part 2)

### მიზანი
შეკვეთის გაფორმება და თრექინგი

### დავალებები

- [ ] **Cart**
  - [ ] Cart screen
  - [ ] Add/remove items
  - [ ] Quantity adjustment
  - [ ] Special instructions

- [ ] **Checkout**
  - [ ] Delivery address input
  - [ ] Order summary
  - [ ] Place order button
  - [ ] Order confirmation

- [ ] **Order Tracking**
  - [ ] Order status screen
  - [ ] Real-time status updates (Socket.io)
  - [ ] Map with driver location
  - [ ] ETA display
  - [ ] Call driver/restaurant buttons

- [ ] **Order History**
  - [ ] Past orders list
  - [ ] Order details
  - [ ] Reorder functionality

- [ ] **Socket.io Integration**
  - [ ] Socket connection
  - [ ] Listen for order updates
  - [ ] Listen for driver location

### შედეგი
✅ მომხმარებელს შეუძლია შეკვეთა და თრექინგი

---

## კვირა 5: Driver App

### მიზანი
კურიერის აპლიკაცია

### დავალებები

- [ ] **Setup**
  - [ ] Expo project (driver app)
  - [ ] Navigation
  - [ ] Shared components

- [ ] **Auth**
  - [ ] Login screen
  - [ ] Driver registration (future)

- [ ] **Home Screen**
  - [ ] Online/Offline toggle
  - [ ] Today's earnings
  - [ ] Available orders list
  - [ ] Current order card

- [ ] **Order Flow**
  - [ ] Order details modal
  - [ ] Accept/Reject buttons
  - [ ] Navigation to restaurant
  - [ ] "Arrived at restaurant" button
  - [ ] "Picked up" button
  - [ ] Navigation to customer
  - [ ] "Delivered" button

- [ ] **Location Tracking**
  - [ ] Background location
  - [ ] Send location to server
  - [ ] Maps integration

- [ ] **Driver APIs**
  - [ ] GET /driver/orders/available
  - [ ] POST /driver/orders/:id/accept
  - [ ] PATCH /driver/orders/:id/status
  - [ ] POST /driver/location

### შედეგი
✅ კურიერს შეუძლია შეკვეთების მიღება და მიწოდება

---

## კვირა 6: Restaurant Dashboard

### მიზანი
რესტორნის ვებ პანელი

### დავალებები

- [ ] **Next.js Setup**
  - [ ] Next.js 14 App Router
  - [ ] Tailwind CSS
  - [ ] Authentication (JWT)

- [ ] **Orders Management**
  - [ ] Incoming orders (with sound notification)
  - [ ] Accept/Reject orders
  - [ ] Set preparation time
  - [ ] Update order status
  - [ ] Order history

- [ ] **Menu Management**
  - [ ] Categories list
  - [ ] Add/Edit/Delete items
  - [ ] Toggle availability
  - [ ] Image upload

- [ ] **Settings**
  - [ ] Working hours
  - [ ] Delivery settings
  - [ ] Profile info

- [ ] **Real-time**
  - [ ] Socket.io for new orders
  - [ ] Audio notification

### შედეგი
✅ რესტორანს შეუძლია შეკვეთების და მენიუს მართვა

---

## კვირა 7: Admin Panel

### მიზანი
ადმინისტრატორის პანელი

### დავალებები

- [ ] **Dashboard**
  - [ ] Overview stats
  - [ ] Today's orders
  - [ ] Active drivers
  - [ ] Revenue

- [ ] **Restaurants Management**
  - [ ] List all restaurants
  - [ ] Add new restaurant
  - [ ] Edit restaurant
  - [ ] Activate/Deactivate

- [ ] **Drivers Management**
  - [ ] List all drivers
  - [ ] Driver details
  - [ ] Approve/Reject
  - [ ] View location

- [ ] **Orders**
  - [ ] All orders list
  - [ ] Filter by status
  - [ ] Order details
  - [ ] Manual intervention

- [ ] **Users**
  - [ ] Customers list
  - [ ] Search users

### შედეგი
✅ ადმინს შეუძლია პლატფორმის მართვა

---

## კვირა 8: Testing & Deployment

### მიზანი
ტესტირება და პროდაქშენზე გაშვება

### დავალებები

- [ ] **Testing**
  - [ ] End-to-end testing
  - [ ] Bug fixes
  - [ ] Performance optimization
  - [ ] Edge cases

- [ ] **Backend Deployment**
  - [ ] Railway/Render setup
  - [ ] Environment variables
  - [ ] Database migration
  - [ ] Domain setup

- [ ] **Web Deployment**
  - [ ] Vercel deployment (restaurant + admin)
  - [ ] Custom domain

- [ ] **Mobile**
  - [ ] Expo build (APK)
  - [ ] TestFlight setup (optional)
  - [ ] Internal testing

- [ ] **Documentation**
  - [ ] API documentation update
  - [ ] Setup instructions
  - [ ] Admin guide

- [ ] **Launch Preparation**
  - [ ] Seed production data
  - [ ] Test with real restaurants
  - [ ] Soft launch

### შედეგი
✅ პლატფორმა მზადაა გასაშვებად

---

## Progress Tracking

### კვირა 1
```
[ ] Setup    ░░░░░░░░░░ 0%
```

### Overall
```
[ ] Total    ░░░░░░░░░░ 0%
```

---

## შენიშვნები

1. **პრიორიტეტი**: თუ დრო არ გვყოფნის, ჯერ Customer + Driver apps, მერე Restaurant dashboard
2. **MVP Focus**: არ გადავუხვიოთ scope-ს, მხოლოდ MVP ფუნქციები
3. **Daily Updates**: ყოველდღე განვაახლოთ პროგრესი
4. **Blockers**: პრობლემები დაუყოვნებლივ უნდა მოგვარდეს

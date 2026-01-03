# MTREDEBI - API დოკუმენტაცია

## Base URL

```
Development: http://localhost:3001/api/v1
Production:  https://api.mtredebi.ge/api/v1
```

---

## Authentication

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Endpoints

### 🔐 Auth

#### Send OTP
```http
POST /auth/send-otp
```

**Request:**
```json
{
  "phone": "+995599123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP გაგზავნილია"
}
```

---

#### Verify OTP
```http
POST /auth/verify-otp
```

**Request:**
```json
{
  "phone": "+995599123456",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "phone": "+995599123456",
    "name": null,
    "role": "CUSTOMER"
  },
  "isNewUser": true
}
```

---

#### Get Current User
```http
GET /auth/me
```

**Response:**
```json
{
  "id": "uuid",
  "phone": "+995599123456",
  "name": "გიორგი",
  "avatarUrl": "https://...",
  "role": "CUSTOMER"
}
```

---

#### Update Profile
```http
PATCH /auth/profile
```

**Request:**
```json
{
  "name": "გიორგი გიორგაძე"
}
```

---

### 🍽️ Restaurants

#### List Restaurants
```http
GET /restaurants
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| lat | float | მომხმარებლის latitude |
| lng | float | მომხმარებლის longitude |
| search | string | ძებნის ტექსტი |
| category | string | კატეგორიის ID |

**Response:**
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "მაქს ბურგერი",
      "description": "საუკეთესო ბურგერები სამტრედიაში",
      "imageUrl": "https://...",
      "address": "რუსთაველის 15",
      "distance": 1.2,
      "deliveryTime": "25-35",
      "deliveryFee": 3,
      "minOrderAmount": 10,
      "isOpen": true
    }
  ]
}
```

---

#### Get Restaurant Details
```http
GET /restaurants/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "მაქს ბურგერი",
  "description": "...",
  "address": "რუსთაველის 15",
  "phone": "+995599000000",
  "imageUrl": "https://...",
  "coverImageUrl": "https://...",
  "lat": 42.1234,
  "lng": 42.1234,
  "deliveryFee": 3,
  "minOrderAmount": 10,
  "avgPrepTime": 30,
  "isOpen": true,
  "workingHours": [
    { "dayOfWeek": 0, "openTime": "10:00", "closeTime": "22:00", "isClosed": false }
  ],
  "categories": [
    {
      "id": "uuid",
      "name": "ბურგერები",
      "items": [
        {
          "id": "uuid",
          "name": "კლასიკ ბურგერი",
          "description": "ხორცი, ყველი, სალათა, პომიდორი",
          "price": 12.5,
          "imageUrl": "https://...",
          "isAvailable": true
        }
      ]
    }
  ]
}
```

---

### 🛒 Orders

#### Create Order
```http
POST /orders
```

**Request:**
```json
{
  "restaurantId": "uuid",
  "items": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "notes": "კეტჩუპის გარეშე"
    }
  ],
  "deliveryAddress": "რუსთაველის 20, სამტრედია",
  "deliveryLat": 42.1234,
  "deliveryLng": 42.1234,
  "customerNotes": "მეორე სართული"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "orderNumber": "MTR-001",
    "status": "PENDING",
    "subtotal": 25,
    "deliveryFee": 3,
    "totalAmount": 28,
    "estimatedTime": "35-45 წუთი"
  }
}
```

---

#### Get Order Details
```http
GET /orders/:id
```

**Response:**
```json
{
  "id": "uuid",
  "orderNumber": "MTR-001",
  "status": "DELIVERING",
  "restaurant": {
    "id": "uuid",
    "name": "მაქს ბურგერი",
    "phone": "+995599000000",
    "address": "რუსთაველის 15",
    "lat": 42.1234,
    "lng": 42.1234
  },
  "driver": {
    "id": "uuid",
    "name": "დავითი",
    "phone": "+995599111111",
    "currentLat": 42.1235,
    "currentLng": 42.1235,
    "vehicleType": "SCOOTER"
  },
  "items": [
    {
      "name": "კლასიკ ბურგერი",
      "price": 12.5,
      "quantity": 2,
      "notes": "კეტჩუპის გარეშე"
    }
  ],
  "deliveryAddress": "რუსთაველის 20",
  "subtotal": 25,
  "deliveryFee": 3,
  "totalAmount": 28,
  "createdAt": "2024-01-15T10:30:00Z",
  "acceptedAt": "2024-01-15T10:32:00Z",
  "estimatedDeliveryTime": "2024-01-15T11:15:00Z"
}
```

---

#### Get User Orders (History)
```http
GET /orders
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | active / completed |
| limit | int | default: 20 |
| offset | int | default: 0 |

---

#### Cancel Order
```http
POST /orders/:id/cancel
```

**Request:**
```json
{
  "reason": "აღარ მჭირდება"
}
```

---

### 🚗 Driver Endpoints

#### Get Available Orders (Driver)
```http
GET /driver/orders/available
```

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "orderNumber": "MTR-001",
      "restaurant": {
        "name": "მაქს ბურგერი",
        "address": "რუსთაველის 15",
        "lat": 42.1234,
        "lng": 42.1234
      },
      "deliveryAddress": "რუსთაველის 20",
      "deliveryLat": 42.1240,
      "deliveryLng": 42.1240,
      "totalAmount": 28,
      "estimatedEarning": 5,
      "distanceToRestaurant": 0.8,
      "distanceToCustomer": 1.2
    }
  ]
}
```

---

#### Accept Order (Driver)
```http
POST /driver/orders/:id/accept
```

---

#### Update Order Status (Driver)
```http
PATCH /driver/orders/:id/status
```

**Request:**
```json
{
  "status": "PICKED_UP"
}
```

---

#### Update Location (Driver)
```http
POST /driver/location
```

**Request:**
```json
{
  "lat": 42.1235,
  "lng": 42.1236
}
```

---

#### Toggle Online Status (Driver)
```http
POST /driver/toggle-online
```

**Response:**
```json
{
  "isOnline": true
}
```

---

### 🏪 Restaurant Endpoints

#### Get Restaurant Orders
```http
GET /restaurant/orders
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | pending / active / completed |

---

#### Accept Order (Restaurant)
```http
POST /restaurant/orders/:id/accept
```

**Request:**
```json
{
  "prepTime": 25
}
```

---

#### Reject Order (Restaurant)
```http
POST /restaurant/orders/:id/reject
```

**Request:**
```json
{
  "reason": "მარაგი ამოიწურა"
}
```

---

#### Update Order Status (Restaurant)
```http
PATCH /restaurant/orders/:id/status
```

**Request:**
```json
{
  "status": "PREPARING" | "READY"
}
```

---

#### Get Menu
```http
GET /restaurant/menu
```

---

#### Update Menu Item Availability
```http
PATCH /restaurant/menu/:itemId/availability
```

**Request:**
```json
{
  "isAvailable": false
}
```

---

### 👑 Admin Endpoints

#### List All Users
```http
GET /admin/users
```

---

#### List All Restaurants
```http
GET /admin/restaurants
```

---

#### Create Restaurant
```http
POST /admin/restaurants
```

---

#### List All Drivers
```http
GET /admin/drivers
```

---

#### Approve Driver
```http
POST /admin/drivers/:id/approve
```

---

#### Get Dashboard Stats
```http
GET /admin/stats
```

**Response:**
```json
{
  "todayOrders": 45,
  "todayRevenue": 1250,
  "activeDrivers": 8,
  "activeRestaurants": 12,
  "pendingOrders": 3
}
```

---

## Socket.io Events

### Connection
```javascript
const socket = io('wss://api.mtredebi.ge', {
  auth: { token: 'jwt_token' }
});
```

### Customer Events

**Listen:**
```javascript
socket.on('order:updated', (data) => {
  // { orderId, status, driver, estimatedTime }
});

socket.on('driver:location', (data) => {
  // { orderId, lat, lng }
});
```

### Driver Events

**Emit:**
```javascript
socket.emit('location:update', { lat, lng, orderId });
socket.emit('order:status', { orderId, status });
```

**Listen:**
```javascript
socket.on('order:new', (data) => {
  // New order available for pickup
});
```

### Restaurant Events

**Listen:**
```javascript
socket.on('order:new', (data) => {
  // New order received - play notification sound
});
```

---

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "INVALID_OTP",
    "message": "არასწორი კოდი"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED | არაავტორიზებული |
| INVALID_OTP | არასწორი OTP კოდი |
| OTP_EXPIRED | OTP კოდს ვადა გაუვიდა |
| NOT_FOUND | ვერ მოიძებნა |
| VALIDATION_ERROR | ვალიდაციის შეცდომა |
| RESTAURANT_CLOSED | რესტორანი დახურულია |
| MIN_ORDER_AMOUNT | მინიმალურ თანხას არ აკმაყოფილებს |
| ORDER_CANNOT_CANCEL | შეკვეთის გაუქმება შეუძლებელია |

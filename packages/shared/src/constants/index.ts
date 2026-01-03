// Order status labels (Georgian)
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'მოლოდინში',
  ACCEPTED: 'მიღებულია',
  PREPARING: 'მზადდება',
  READY: 'მზადაა',
  DRIVER_ASSIGNED: 'კურიერი დანიშნულია',
  PICKED_UP: 'აღებულია',
  DELIVERING: 'მიწოდების პროცესში',
  DELIVERED: 'მიწოდებულია',
  CANCELLED: 'გაუქმებულია',
};

// Vehicle types
export const VEHICLE_TYPES = {
  WALKING: 'ფეხით',
  BICYCLE: 'ველოსიპედი',
  SCOOTER: 'სკუტერი',
  CAR: 'მანქანა',
};

// Days of week (Georgian)
export const DAYS_OF_WEEK = [
  'კვირა',
  'ორშაბათი',
  'სამშაბათი',
  'ოთხშაბათი',
  'ხუთშაბათი',
  'პარასკევი',
  'შაბათი',
];

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_OTP: 'INVALID_OTP',
  OTP_EXPIRED: 'OTP_EXPIRED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESTAURANT_CLOSED: 'RESTAURANT_CLOSED',
  MIN_ORDER_AMOUNT: 'MIN_ORDER_AMOUNT',
  ORDER_CANNOT_CANCEL: 'ORDER_CANNOT_CANCEL',
};

// OTP settings
export const OTP_CONFIG = {
  length: 6,
  expiresInMinutes: 5,
};

// Pagination defaults
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
};

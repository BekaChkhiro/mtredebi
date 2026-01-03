// Generate order number: MTR-001, MTR-002, etc.
export const generateOrderNumber = (sequence: number): string => {
  return `MTR-${String(sequence).padStart(3, '0')}`;
};

// Generate random OTP code
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

// Format price in Georgian Lari
export const formatPrice = (price: number): string => {
  return `${price.toFixed(2)} ₾`;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Estimate delivery time based on distance
export const estimateDeliveryTime = (distanceKm: number, prepTimeMinutes: number): string => {
  const deliveryMinutes = Math.ceil(distanceKm * 3); // ~3 min per km
  const totalMin = prepTimeMinutes + deliveryMinutes;
  const totalMax = totalMin + 10;
  return `${totalMin}-${totalMax}`;
};

// Format phone number for display
export const formatPhone = (phone: string): string => {
  // +995599123456 -> +995 599 12 34 56
  if (phone.startsWith('+995') && phone.length === 13) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)} ${phone.slice(11)}`;
  }
  return phone;
};

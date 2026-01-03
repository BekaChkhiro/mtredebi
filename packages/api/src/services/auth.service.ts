import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

const prisma = new PrismaClient();

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 4;

interface TokenPayload {
  userId: string;
  phone: string;
  role: string;
}

interface AuthResult {
  user: User;
  token: string;
  isNewUser: boolean;
}

// Generate random OTP code
function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP via Twilio (or log in development)
async function sendOTPViaSMS(phone: string, code: string): Promise<boolean> {
  if (config.nodeEnv === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${code}`);
    return true;
  }

  // Production: Use Twilio
  if (!config.twilio.accountSid || !config.twilio.authToken) {
    console.error('Twilio credentials not configured');
    return false;
  }

  try {
    const twilio = await import('twilio');
    const client = twilio.default(config.twilio.accountSid, config.twilio.authToken);

    await client.messages.create({
      body: `თქვენი MTREDEBI კოდი: ${code}`,
      from: config.twilio.phoneNumber,
      to: phone,
    });

    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

// Send OTP to phone number
export async function sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
  // Normalize phone number
  const normalizedPhone = phone.replace(/\s/g, '');

  // Check rate limiting (max 3 OTPs per 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentOTPs = await prisma.oTP.count({
    where: {
      phone: normalizedPhone,
      createdAt: { gte: tenMinutesAgo },
    },
  });

  if (recentOTPs >= 3) {
    return {
      success: false,
      message: 'ძალიან ბევრი მცდელობა. სცადეთ 10 წუთში.',
    };
  }

  // Generate OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Save OTP to database
  await prisma.oTP.create({
    data: {
      phone: normalizedPhone,
      code,
      expiresAt,
    },
  });

  // Send OTP
  const sent = await sendOTPViaSMS(normalizedPhone, code);

  if (!sent) {
    return {
      success: false,
      message: 'SMS გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.',
    };
  }

  return {
    success: true,
    message: 'კოდი გაგზავნილია.',
  };
}

// Verify OTP and return token
export async function verifyOTP(phone: string, code: string): Promise<AuthResult | null> {
  const normalizedPhone = phone.replace(/\s/g, '');

  // Find valid OTP
  const otp = await prisma.oTP.findFirst({
    where: {
      phone: normalizedPhone,
      code,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) {
    return null;
  }

  // Mark OTP as used
  await prisma.oTP.update({
    where: { id: otp.id },
    data: { isUsed: true },
  });

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });

  const isNewUser = !user;

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
      },
    });
  }

  // Generate JWT token
  const payload: TokenPayload = {
    userId: user.id,
    phone: user.phone,
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as string,
  } as jwt.SignOptions);

  return {
    user,
    token,
    isNewUser,
  };
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch {
    return null;
  }
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
    },
  });
}

// Update user profile
export async function updateUser(
  userId: string,
  data: { name?: string; avatarUrl?: string }
): Promise<User | null> {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

// Clean up expired OTPs (can be called periodically)
export async function cleanupExpiredOTPs(): Promise<number> {
  const result = await prisma.oTP.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isUsed: true },
      ],
    },
  });
  return result.count;
}

import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';

// Validation schemas
const sendOTPSchema = z.object({
  phone: z
    .string()
    .min(9, 'ტელეფონის ნომერი ძალიან მოკლეა')
    .regex(/^\+?[0-9\s]+$/, 'არასწორი ტელეფონის ნომერი'),
});

const verifyOTPSchema = z.object({
  phone: z.string().min(9),
  code: z.string().length(4, 'კოდი უნდა იყოს 4 ციფრი'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'სახელი ძალიან მოკლეა').max(50).optional(),
});

const pushTokenSchema = z.object({
  pushToken: z.string().min(1).max(200),
});

// POST /api/v1/auth/send-otp
export async function sendOTP(req: Request, res: Response): Promise<void> {
  try {
    const validation = sendOTPSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
      return;
    }

    const { phone } = validation.data;
    const result = await authService.sendOTP(phone);

    if (!result.success) {
      res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: result.message },
      });
      return;
    }

    res.json({
      success: true,
      data: { message: result.message },
    });
  } catch (error) {
    console.error('sendOTP error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// POST /api/v1/auth/verify-otp
export async function verifyOTP(req: Request, res: Response): Promise<void> {
  try {
    const validation = verifyOTPSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
      return;
    }

    const { phone, code } = validation.data;
    const result = await authService.verifyOTP(phone, code);

    if (!result) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_OTP', message: 'არასწორი ან ვადაგასული კოდი' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        token: result.token,
        user: {
          id: result.user.id,
          phone: result.user.phone,
          name: result.user.name,
          avatarUrl: result.user.avatarUrl,
          role: result.user.role,
        },
        isNewUser: result.isNewUser,
      },
    });
  } catch (error) {
    console.error('verifyOTP error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// GET /api/v1/auth/me
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'ავტორიზაცია საჭიროა' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          phone: req.user.phone,
          name: req.user.name,
          avatarUrl: req.user.avatarUrl,
          role: req.user.role,
          createdAt: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// PUT /api/v1/auth/me
export async function updateMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'ავტორიზაცია საჭიროა' },
      });
      return;
    }

    const validation = updateProfileSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
      return;
    }

    const updatedUser = await authService.updateUser(req.user.id, validation.data);

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'მომხმარებელი ვერ მოიძებნა' },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          name: updatedUser.name,
          avatarUrl: updatedUser.avatarUrl,
          role: updatedUser.role,
        },
      },
    });
  } catch (error) {
    console.error('updateMe error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// PUT /api/v1/auth/push-token
export async function updatePushToken(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'ავტორიზაცია საჭიროა' },
      });
      return;
    }

    const validation = pushTokenSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
      return;
    }

    await authService.updatePushToken(req.user.id, validation.data.pushToken);

    res.json({
      success: true,
      data: { message: 'Push token updated' },
    });
  } catch (error) {
    console.error('updatePushToken error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { generateOTP, hashOTP, getOTPExpiry, verifyOTP, hashPassword, comparePassword } from '../utils/crypto';
import { generateAccessToken, generateRefreshToken, hashToken, getRefreshTokenExpiry } from '../utils/jwt';
import { Session } from '../models';
import { ValidationError, UnauthorizedError } from '../utils/AppError';

// Simple email-based registration and login (no OTP, no SMS)
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Check if user exists
    const existing = await User.findOne({ phone: email }); // Reusing phone field for email
    if (existing) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      phone: email, // Using phone field for email
      phoneVerified: true, // Auto-verify for simplicity
      otpHash: passwordHash, // Storing password hash here
      profile: { name }
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    // Save session
    await Session.create({
      userId: user._id,
      refreshToken: refreshTokenHash,
      deviceId: 'web',
      expiresAt: getRefreshTokenExpiry()
    });

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.phone,
          name: user.profile.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = await User.findOne({ phone: email });
    if (!user || !user.otpHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValid = await comparePassword(password, user.otpHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    // Save session
    await Session.create({
      userId: user._id,
      refreshToken: refreshTokenHash,
      deviceId: 'web',
      expiresAt: getRefreshTokenExpiry()
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.phone,
          name: user.profile.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const tokenHash = hashToken(refreshToken);
    const session = await Session.findOne({ refreshToken: tokenHash }).populate('userId');

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findById(session.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Generate new access token
    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });

    res.status(200).json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await Session.deleteOne({ refreshToken: tokenHash });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

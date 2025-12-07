import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { generateOTP, hashOTP, getOTPExpiry, verifyOTP, hashPassword, comparePassword } from '../utils/crypto';
import { generateAccessToken, generateRefreshToken, hashToken, getRefreshTokenExpiry } from '../utils/jwt';
import { Session } from '../models';
import { ValidationError, UnauthorizedError } from '../utils/AppError';
import { sendOTPEmail } from '../services/email.service';

// Simple email-based registration and login (no OTP, no SMS)
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email: rawEmail, password, name } = req.body;

    if (!rawEmail || !password) {
      throw new ValidationError('Email and password are required');
    }

    const email = rawEmail.toString().trim().toLowerCase();

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
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || !password) {
      throw new ValidationError('Email and password are required');
    }

    const email = rawEmail.toString().trim().toLowerCase();

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

// Password Reset Flow
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawEmail = req.body.email;

    if (!rawEmail) {
      throw new ValidationError('Email is required');
    }

    const email = rawEmail.toString().trim().toLowerCase();

    // Find user
    const user = await User.findOne({ phone: email });
    if (!user) {
      console.warn(`[ForgotPassword] User not found for email: '${email}' (Raw: '${rawEmail}')`);
      // Don't reveal if email exists - return success anyway for security
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, an OTP has been sent'
      });
      return;
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    const otpExpiresAt = getOTPExpiry();
    
    // Store OTP hash in a temporary field (using resetOtp fields)
    user.resetOtp = await hashOTP(otp);
    user.resetOtpExpiry = otpExpiresAt;
    await user.save();


    // Send email
    try {
      await sendOTPEmail(email, otp);
      console.log(`[ForgotPassword] OTP email sent to ${email}`);
    } catch (emailError) {
      console.error(`[ForgotPassword] Failed to send email to ${email}:`, emailError);
      // We still return success to the user so they don't know it failed? 
      // Or maybe we should throw? Usually better to fail safely or retry. 
      // For now, logging is key.
    }

    // In development specific usage, helpful to still log if email fails or for quick testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] Password Reset OTP for ${email}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, an OTP has been sent'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ValidationError('Email and OTP are required');
    }

    // Find user
    const user = await User.findOne({ phone: email });
    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      throw new UnauthorizedError('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (user.resetOtpExpiry < new Date()) {
      throw new UnauthorizedError('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, user.resetOtp);
    if (!isValid) {
      throw new UnauthorizedError('Invalid OTP');
    }

    // Generate a temporary reset token
    const resetToken = generateRefreshToken();
    const resetTokenHash = hashToken(resetToken);
    
    // Store reset token (expires in 10 minutes)
    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: { resetToken },
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      throw new ValidationError('Reset token and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const tokenHash = hashToken(resetToken);
    
    // Find user with valid reset token
    const user = await User.findOne({ 
      resetToken: tokenHash,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // Hash new password and update
    const passwordHash = await hashPassword(newPassword);
    user.otpHash = passwordHash;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    // Invalidate all existing sessions for security
    await Session.deleteMany({ userId: user._id });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

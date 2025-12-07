import express from 'express';
import { register, login, refresh, logout, forgotPassword, verifyResetOTP, resetPassword } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Register with email and password
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login with email and password
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', refresh);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout and invalidate refresh token
 * @access Public
 */
router.post('/logout', logout);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request password reset OTP
 * @access Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route POST /api/v1/auth/verify-reset-otp
 * @desc Verify password reset OTP
 * @access Public
 */
router.post('/verify-reset-otp', verifyResetOTP);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password', resetPassword);

export default router;

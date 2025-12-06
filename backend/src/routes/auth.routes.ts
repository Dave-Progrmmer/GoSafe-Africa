import express from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller';
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

export default router;

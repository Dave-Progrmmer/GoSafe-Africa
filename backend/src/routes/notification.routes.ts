import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';

const router = express.Router();

router.use(authenticate); // Protect all notification routes

router.get('/', getUserNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;

import express from 'express';
import { createReport, getReports, getReport, confirmReport, denyReport, deleteReport } from '../controllers/report.controller';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

/**
 * @route POST /api/v1/reports
 * @desc Create new report
 * @access Protected
 */
router.post('/', authenticate, createReport);

/**
 * @route GET /api/v1/reports
 * @desc Get reports (with geo query)
 * @access Public
 */
router.get('/', getReports);

/**
 * @route GET /api/v1/reports/:id
 * @desc Get single report
 * @access Public
 */
router.get('/:id', getReport);

/**
 * @route POST /api/v1/reports/:id/confirm
 * @desc Confirm report
 * @access Protected
 */
router.post('/:id/confirm', authenticate, confirmReport);

/**
 * @route POST /api/v1/reports/:id/deny
 * @desc Deny report
 * @access Protected
 */
router.post('/:id/deny', authenticate, denyReport);

/**
 * @route DELETE /api/v1/reports/:id
 * @desc Delete report
 * @access Protected
 */
router.delete('/:id', authenticate, deleteReport);

export default router;

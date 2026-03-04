import { Router } from 'express';
import { generateProxyReport, generateTimetable, generateBulkTimetable } from '../controllers/reports.controller';

const router = Router();

router.post('/proxy-report', generateProxyReport as any);
router.post('/timetable', generateTimetable as any);
router.post('/bulk-timetable', generateBulkTimetable as any);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: PDF Generation endpoints
 */

/**
 * @swagger
 * /reports/proxy-report:
 *   post:
 *     summary: Generate a Proxy Report PDF
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proxies:
 *                 type: array
 *                 items:
 *                   type: object
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: PDF file array buffer
 * 
 * /reports/timetable:
 *   post:
 *     summary: Generate a Timetable PDF
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timetable:
 *                 type: array
 *                 items:
 *                   type: object
 *               periods:
 *                 type: array
 *                 items:
 *                   type: object
 *               type:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: PDF file array buffer
 * 
 * /reports/bulk-timetable:
 *   post:
 *     summary: Generate a Bulk Timetable PDF
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               periods:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: PDF file array buffer
 */
export default router;

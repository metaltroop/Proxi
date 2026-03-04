"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const router = (0, express_1.Router)();
router.post('/proxy-report', reports_controller_1.generateProxyReport);
router.post('/timetable', reports_controller_1.generateTimetable);
router.post('/bulk-timetable', reports_controller_1.generateBulkTimetable);
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
exports.default = router;

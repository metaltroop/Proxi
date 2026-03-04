"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Periods
 *   description: Period structure management
 */
/**
 * @swagger
 * /periods:
 *   get:
 *     summary: Get all periods
 *     tags: [Periods]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of periods
 *   post:
 *     summary: Create a new period
 *     tags: [Periods]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - periodNo
 *               - periodType
 *               - startTime
 *               - endTime
 *             properties:
 *               periodNo:
 *                 type: integer
 *               periodType:
 *                 type: string
 *                 enum: [REGULAR, BREAK, ASSEMBLY, PTM]
 *               startTime:
 *                 type: string
 *                 format: time
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 format: time
 *                 example: "08:45"
 *     responses:
 *       201:
 *         description: Period created successfully
 *
 * /periods/{id}:
 *   get:
 *     summary: Get a single period
 *     tags: [Periods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Period details
 *   put:
 *     summary: Update a period
 *     tags: [Periods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               periodNo:
 *                 type: integer
 *               periodType:
 *                 type: string
 *                 enum: [REGULAR, BREAK, ASSEMBLY, PTM]
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Period updated successfully
 *   delete:
 *     summary: Delete a period
 *     tags: [Periods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Period deleted successfully
 */
// Get all periods
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const periods = await database_1.default.period.findMany({
            where: { isActive: true },
            orderBy: { periodNo: 'asc' }
        });
        res.json({ periods });
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Get periods');
    }
});
// Get single period
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const period = await database_1.default.period.findUnique({
            where: { id: req.params.id }
        });
        if (!period) {
            return res.status(404).json({ error: 'Period not found' });
        }
        res.json({ period });
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Get period');
    }
});
// Create period
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { periodNo, periodType, startTime, endTime } = req.body;
        // Validate time
        if (startTime >= endTime) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }
        const period = await database_1.default.period.create({
            data: {
                periodNo,
                periodType,
                startTime,
                endTime
            }
        });
        res.status(201).json({ period });
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Create period');
    }
});
// Update period
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { periodNo, periodType, startTime, endTime } = req.body;
        // Validate time
        if (startTime >= endTime) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }
        const period = await database_1.default.period.update({
            where: { id: req.params.id },
            data: {
                periodNo,
                periodType,
                startTime,
                endTime
            }
        });
        res.json({ period });
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Update period');
    }
});
// Delete period (soft delete)
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        await database_1.default.period.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });
        res.json({ message: 'Period deleted successfully' });
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Delete period');
    }
});
exports.default = router;
//# sourceMappingURL=periods.routes.js.map
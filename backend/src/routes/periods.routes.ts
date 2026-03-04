import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { handleRouteError } from '../utils/errorHandler';

const router = Router();

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
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const periods = await prisma.period.findMany({
            where: { isActive: true },
            orderBy: { periodNo: 'asc' }
        });

        res.json({ periods });
    } catch (error) {
        handleRouteError(res, error, 'Get periods');
    }
});

// Get single period
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const period = await prisma.period.findUnique({
            where: { id: req.params.id }
        });

        if (!period) {
            return res.status(404).json({ error: 'Period not found' });
        }

        res.json({ period });
    } catch (error) {
        handleRouteError(res, error, 'Get period');
    }
});

// Create period
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { periodNo, periodType, startTime, endTime } = req.body;

        // Validate time
        if (startTime >= endTime) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        const period = await prisma.period.create({
            data: {
                periodNo,
                periodType,
                startTime,
                endTime
            }
        });

        res.status(201).json({ period });
    } catch (error) {
        handleRouteError(res, error, 'Create period');
    }
});

// Update period
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { periodNo, periodType, startTime, endTime } = req.body;

        // Validate time
        if (startTime >= endTime) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        const period = await prisma.period.update({
            where: { id: req.params.id },
            data: {
                periodNo,
                periodType,
                startTime,
                endTime
            }
        });

        res.json({ period });
    } catch (error) {
        handleRouteError(res, error, 'Update period');
    }
});

// Delete period (soft delete)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
    try {
        await prisma.period.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });

        res.json({ message: 'Period deleted successfully' });
    } catch (error) {
        handleRouteError(res, error, 'Delete period');
    }
});

export default router;

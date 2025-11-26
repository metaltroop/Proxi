import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Get all periods
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const periods = await prisma.period.findMany({
            where: { isActive: true },
            orderBy: { periodNo: 'asc' }
        });

        res.json({ periods });
    } catch (error) {
        console.error('Get periods error:', error);
        res.status(500).json({ error: 'Failed to get periods' });
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
        console.error('Get period error:', error);
        res.status(500).json({ error: 'Failed to get period' });
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
        console.error('Create period error:', error);
        res.status(500).json({ error: 'Failed to create period' });
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
        console.error('Update period error:', error);
        res.status(500).json({ error: 'Failed to update period' });
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
        console.error('Delete period error:', error);
        res.status(500).json({ error: 'Failed to delete period' });
    }
});

export default router;

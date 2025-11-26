import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { getAvailableTeachers, autoAssignProxies } from '../services/proxyAlgorithm';

const router = Router();

// Get all proxies with filters
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { date, teacherId, classId } = req.query;

        const where: any = {};

        if (date) {
            where.date = new Date(date as string);
        }

        if (teacherId) {
            where.OR = [
                { absentTeacherId: teacherId },
                { assignedTeacherId: teacherId }
            ];
        }

        if (classId) {
            where.classId = classId;
        }

        const proxies = await prisma.proxy.findMany({
            where,
            include: {
                absentTeacher: true,
                assignedTeacher: true,
                class: true,
                subject: true,
                period: true,
                creator: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: [
                { date: 'desc' },
                { period: { periodNo: 'asc' } }
            ]
        });

        res.json({ proxies });
    } catch (error) {
        console.error('Get proxies error:', error);
        res.status(500).json({ error: 'Failed to get proxies' });
    }
});

// Get single proxy
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const proxy = await prisma.proxy.findUnique({
            where: { id: req.params.id },
            include: {
                absentTeacher: true,
                assignedTeacher: true,
                class: true,
                subject: true,
                period: true,
                creator: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!proxy) {
            return res.status(404).json({ error: 'Proxy not found' });
        }

        res.json({ proxy });
    } catch (error) {
        console.error('Get proxy error:', error);
        res.status(500).json({ error: 'Failed to get proxy' });
    }
});

// Get available teachers for a specific period
router.post('/available-teachers', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { date, periodId, subjectId, absentTeacherId } = req.body;

        const availableTeachers = await getAvailableTeachers(
            new Date(date),
            periodId,
            subjectId,
            absentTeacherId
        );

        res.json({ availableTeachers });
    } catch (error) {
        console.error('Get available teachers error:', error);
        res.status(500).json({ error: 'Failed to get available teachers' });
    }
});

// Auto-assign proxies for an absent teacher
router.post('/auto-assign', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { date, absentTeacherId } = req.body;

        const assignments = await autoAssignProxies(
            new Date(date),
            absentTeacherId
        );

        res.json({ assignments });
    } catch (error) {
        console.error('Auto-assign error:', error);
        res.status(500).json({ error: 'Failed to auto-assign proxies' });
    }
});

// Assign proxies (batch)
router.post('/assign', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { date, absentTeacherId, absenceReason, assignments, notes } = req.body;

        // Mark teacher as absent
        await prisma.teacherAbsence.upsert({
            where: {
                teacherId_date: {
                    teacherId: absentTeacherId,
                    date: new Date(date)
                }
            },
            create: {
                teacherId: absentTeacherId,
                date: new Date(date),
                reason: absenceReason,
                markedBy: req.user!.id
            },
            update: {
                reason: absenceReason
            }
        });

        // Create proxy assignments
        const proxies = await Promise.all(
            assignments.map((assignment: any) =>
                prisma.proxy.create({
                    data: {
                        date: new Date(date),
                        absentTeacherId,
                        absenceReason,
                        periodId: assignment.periodId,
                        classId: assignment.classId,
                        subjectId: assignment.subjectId,
                        assignedTeacherId: assignment.assignedTeacherId,
                        notes,
                        createdBy: req.user!.id
                    },
                    include: {
                        absentTeacher: true,
                        assignedTeacher: true,
                        class: true,
                        subject: true,
                        period: true
                    }
                })
            )
        );

        res.status(201).json({
            message: 'Proxies assigned successfully',
            proxies
        });
    } catch (error) {
        console.error('Assign proxies error:', error);
        res.status(500).json({ error: 'Failed to assign proxies' });
    }
});

// Get teacher proxy load
router.get('/teacher-load/:teacherId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const where: any = {
            assignedTeacherId: req.params.teacherId
        };

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        }

        const proxies = await prisma.proxy.findMany({
            where,
            include: {
                class: true,
                subject: true,
                period: true
            }
        });

        res.json({
            teacherId: req.params.teacherId,
            proxyCount: proxies.length,
            proxies
        });
    } catch (error) {
        console.error('Get teacher load error:', error);
        res.status(500).json({ error: 'Failed to get teacher load' });
    }
});

// Delete proxy
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        await prisma.proxy.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Proxy deleted successfully' });
    } catch (error) {
        console.error('Delete proxy error:', error);
        res.status(500).json({ error: 'Failed to delete proxy' });
    }
});

export default router;

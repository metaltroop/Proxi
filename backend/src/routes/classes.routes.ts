import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import { handleRouteError } from '../utils/errorHandler';

const router = Router();

// Get all classes with filters
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { search, standard } = req.query;

        const where: any = { isActive: true };

        if (search) {
            where.OR = [
                { className: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        if (standard) {
            where.standard = parseInt(standard as string);
        }

        const classes = await prisma.class.findMany({
            where,
            include: {
                classTeacher: true
            },
            orderBy: [
                { standard: 'asc' },
                { division: 'asc' }
            ]
        });

        res.json({ classes });
    } catch (error) {
        handleRouteError(res, error, 'Get classes');
    }
});

// Get single class
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const classData = await prisma.class.findUnique({
            where: { id: req.params.id },
            include: {
                classTeacher: true,
                timetables: {
                    include: {
                        teacher: true,
                        subject: true,
                        period: true
                    }
                }
            }
        });

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        res.json({ class: classData });
    } catch (error) {
        handleRouteError(res, error, 'Get class');
    }
});

// Bulk create classes
router.post('/bulk', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { standards, divisions } = req.body;

        const classesToCreate = [];
        for (const standard of standards) {
            for (const division of divisions) {
                classesToCreate.push({
                    className: `${standard}-${division}`,
                    standard,
                    division
                });
            }
        }

        const result = await prisma.class.createMany({
            data: classesToCreate,
            skipDuplicates: true
        });

        res.status(201).json({
            message: `Created ${result.count} classes`,
            count: result.count
        });
    } catch (error) {
        handleRouteError(res, error, 'Bulk create classes');
    }
});

// Update class
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { className, classTeacherId, numberOfStudents } = req.body;

        // Get the current class to check if class teacher is changing
        const currentClass = await prisma.class.findUnique({
            where: { id: req.params.id }
        });

        // If there was a previous class teacher, unassign them
        if (currentClass?.classTeacherId && currentClass.classTeacherId !== classTeacherId) {
            await prisma.teacher.update({
                where: { id: currentClass.classTeacherId },
                data: {
                    isClassTeacher: false,
                    assignedClassId: null
                }
            });
        }

        // Update the class
        const classData = await prisma.class.update({
            where: { id: req.params.id },
            data: {
                className,
                classTeacherId: classTeacherId && classTeacherId !== '' ? classTeacherId : null,
                numberOfStudents
            },
            include: {
                classTeacher: true
            }
        });

        // If assigning a new class teacher, update the teacher record
        if (classTeacherId && classTeacherId !== '') {
            await prisma.teacher.update({
                where: { id: classTeacherId },
                data: {
                    isClassTeacher: true,
                    assignedClassId: req.params.id
                }
            });
        }

        res.json({ class: classData });
    } catch (error) {
        handleRouteError(res, error, 'Update class');
    }
});

// Delete class (soft delete)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
    try {
        await prisma.class.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });

        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        handleRouteError(res, error, 'Delete class');
    }
});

// Get class timetable
router.get('/:id/timetable', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const timetable = await prisma.timetable.findMany({
            where: { classId: req.params.id },
            include: {
                teacher: true,
                subject: true,
                period: true
            },
            orderBy: [
                { day: 'asc' },
                { period: { periodNo: 'asc' } }
            ]
        });

        res.json({ timetable });
    } catch (error) {
        handleRouteError(res, error, 'Get timetable');
    }
});

export default router;

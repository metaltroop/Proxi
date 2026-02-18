import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole, DayOfWeek } from '@prisma/client';
import { getTimetablePdf, getBulkTimetablePdf } from '../services/reportingClient';

const router = Router();

// Get timetable by query params (classId or teacherId)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { classId, teacherId } = req.query;

        const where: any = {};
        if (classId) where.classId = classId as string;
        if (teacherId) where.teacherId = teacherId as string;

        const timetable = await prisma.timetable.findMany({
            where,
            include: {
                class: true,
                teacher: true,
                subject: true,
                period: true
            },
            orderBy: [
                { day: 'asc' },
                { period: { periodNo: 'asc' } }
            ]
        });

        // Transform day enum to dayOfWeek number for frontend
        const dayToNumber: Record<string, number> = {
            MONDAY: 0,
            TUESDAY: 1,
            WEDNESDAY: 2,
            THURSDAY: 3,
            FRIDAY: 4,
            SATURDAY: 5
        };

        const transformedTimetable = timetable.map(entry => ({
            ...entry,
            dayOfWeek: dayToNumber[entry.day]
        }));

        res.json({ timetable: transformedTimetable });
    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({ error: 'Failed to get timetable' });
    }
});

// Download timetable PDF
router.get('/download-pdf', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { classId, teacherId } = req.query;

        if (!classId && !teacherId) {
            return res.status(400).json({ error: 'Class ID or Teacher ID is required' });
        }

        const where: any = {};
        if (classId) where.classId = classId as string;
        if (teacherId) where.teacherId = teacherId as string;

        const [timetable, periods, classData, teacherData] = await Promise.all([
            prisma.timetable.findMany({
                where,
                include: {
                    class: true,
                    teacher: true,
                    subject: true,
                    period: true
                },
                orderBy: [
                    { day: 'asc' },
                    { period: { periodNo: 'asc' } }
                ]
            }),
            prisma.period.findMany({ orderBy: { periodNo: 'asc' } }),
            classId ? prisma.class.findUnique({ where: { id: classId as string } }) : Promise.resolve(null),
            teacherId ? prisma.teacher.findUnique({ where: { id: teacherId as string } }) : Promise.resolve(null)
        ]);

        let name = '';
        if (classId && classData) {
            name = `${classData.standard}${classData.division}`;
        } else if (teacherId && teacherData) {
            name = teacherData.name;
        }

        const pdfBuffer = await getTimetablePdf(
            timetable as any,
            periods,
            classId ? 'class' : 'teacher',
            name
        );

        const formattedName = name.replace(/[^a-zA-Z0-9]/g, '_');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${formattedName}_timetable.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

router.get('/teacher/:teacherId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const timetable = await prisma.timetable.findMany({
            where: { teacherId: req.params.teacherId },
            include: {
                class: true,
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
        console.error('Get teacher timetable error:', error);
        res.status(500).json({ error: 'Failed to get timetable' });
    }
});

// Get class timetable
router.get('/class/:classId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const timetable = await prisma.timetable.findMany({
            where: { classId: req.params.classId },
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
        console.error('Get class timetable error:', error);
        res.status(500).json({ error: 'Failed to get timetable' });
    }
});

// Create single timetable entry
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { teacherId, classId, subjectId, periodId, dayOfWeek } = req.body;

        // Map integer to DayOfWeek enum
        const dayMapping: any[] = [
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
            'SATURDAY' as any
        ];

        const entry = await prisma.timetable.create({
            data: {
                teacherId,
                classId,
                subjectId,
                periodId,
                day: dayMapping[dayOfWeek],
                createdBy: req.user!.id
            },
            include: {
                class: true,
                teacher: true,
                subject: true,
                period: true
            }
        });

        res.status(201).json({ entry });
    } catch (error) {
        console.error('Create timetable error:', error);
        res.status(500).json({ error: 'Failed to create timetable entry' });
    }
});

// Update timetable entry
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { teacherId, classId, subjectId, periodId, dayOfWeek } = req.body;

        // Map integer to DayOfWeek enum
        const dayMapping: any[] = [
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
            'SATURDAY' as any
        ];

        const entry = await prisma.timetable.update({
            where: { id: req.params.id },
            data: {
                teacherId,
                classId,
                subjectId,
                periodId,
                day: dayMapping[dayOfWeek]
            },
            include: {
                class: true,
                teacher: true,
                subject: true,
                period: true
            }
        });

        res.json({ entry });
    } catch (error) {
        console.error('Update timetable error:', error);
        res.status(500).json({ error: 'Failed to update timetable entry' });
    }
});

// Delete timetable entry
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        await prisma.timetable.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Timetable entry deleted successfully' });
    } catch (error) {
        console.error('Delete timetable error:', error);
        res.status(500).json({ error: 'Failed to delete timetable entry' });
    }
});

// Check for conflicts
router.post('/conflicts', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { teacherId, classId, day, periodId } = req.body;

        const conflicts = [];

        // Check teacher conflict
        if (teacherId) {
            const teacherConflict = await prisma.timetable.findFirst({
                where: {
                    teacherId,
                    day: day as DayOfWeek,
                    periodId
                },
                include: {
                    class: true,
                    subject: true
                }
            });

            if (teacherConflict) {
                conflicts.push({
                    type: 'teacher',
                    message: `Teacher is already teaching ${teacherConflict.class.className} - ${teacherConflict.subject.shortCode}`
                });
            }
        }

        // Check class conflict
        if (classId) {
            const classConflict = await prisma.timetable.findFirst({
                where: {
                    classId,
                    day: day as DayOfWeek,
                    periodId
                },
                include: {
                    teacher: true,
                    subject: true
                }
            });

            if (classConflict) {
                conflicts.push({
                    type: 'class',
                    message: `Class already has ${classConflict.subject.shortCode} with ${classConflict.teacher.name}`
                });
            }
        }

        res.json({ conflicts });
    } catch (error) {
        console.error('Check conflicts error:', error);
        res.status(500).json({ error: 'Failed to check conflicts' });
    }
});

// Download bulk timetable PDF
router.post('/download-bulk-pdf', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { classIds, teacherIds } = req.body;

        if ((!classIds || classIds.length === 0) && (!teacherIds || teacherIds.length === 0)) {
            return res.status(400).json({ error: 'classIds or teacherIds must be provided' });
        }

        const periods = await prisma.period.findMany();
        const items: any[] = [];

        // Fetch Class Timetables
        if (classIds && classIds.length > 0) {
            const classes = await prisma.class.findMany({
                where: { id: { in: classIds } },
                include: {
                    timetables: {
                        include: {
                            subject: true,
                            teacher: true,
                            class: true,
                            period: true
                        }
                    }
                }
            });

            classes.forEach(cls => {
                items.push({
                    timetable: cls.timetables,
                    type: 'class',
                    name: cls.className
                });
            });
        }

        // Fetch Teacher Timetables
        if (teacherIds && teacherIds.length > 0) {
            const teachers = await prisma.teacher.findMany({
                where: { id: { in: teacherIds } },
                include: {
                    timetables: {
                        include: {
                            subject: true,
                            teacher: true,
                            class: true,
                            period: true
                        }
                    }
                }
            });

            teachers.forEach(teacher => {
                items.push({
                    timetable: teacher.timetables,
                    type: 'teacher',
                    name: teacher.name
                });
            });
        }

        const pdfBuffer = await getBulkTimetablePdf({ items, periods });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="timetables_bulk.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Download bulk PDF error:', error);
        res.status(500).json({ error: 'Failed to download bulk PDF' });
    }
});

export default router;

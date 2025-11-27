import { Router, Request, Response } from 'express';
import { PrismaClient, DayOfWeek } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Day of week mapping
// Day of week mapping
const DAY_TO_ENUM: Record<number, any> = {
    0: DayOfWeek.MONDAY,
    1: DayOfWeek.TUESDAY,
    2: DayOfWeek.WEDNESDAY,
    3: DayOfWeek.THURSDAY,
    4: DayOfWeek.FRIDAY,
    5: 'SATURDAY' as any
};

// GET /proxy/teacher-schedule - Get teacher's timetable for a specific date
router.get('/teacher-schedule', async (req: Request, res: Response) => {
    try {
        const { teacherId, date } = req.query;

        if (!teacherId || !date) {
            return res.status(400).json({ error: 'teacherId and date are required' });
        }

        // Parse date and get day of week
        const selectedDate = new Date(date as string);
        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0-5 (Monday-Saturday)

        if (adjustedDay === 6) {
            return res.status(400).json({ error: 'Sunday is not a school day' });
        }

        const dayEnum = DAY_TO_ENUM[adjustedDay];

        // Get teacher details
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId as string }
        });

        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Get teacher's timetable for this day
        const timetable = await prisma.timetable.findMany({
            where: {
                teacherId: teacherId as string,
                day: dayEnum
            },
            include: {
                period: true,
                class: true,
                subject: true
            },
            orderBy: {
                period: {
                    periodNo: 'asc'
                }
            }
        });

        // Format the response
        const schedule = timetable.map(entry => ({
            periodId: entry.periodId,
            periodNo: entry.period.periodNo,
            startTime: entry.period.startTime,
            endTime: entry.period.endTime,
            classId: entry.classId,
            className: entry.class.className,
            subjectId: entry.subjectId,
            subjectName: entry.subject.subjectName,
            subjectCode: entry.subject.shortCode
        }));

        // Get existing proxies for this teacher and date
        const existingProxies = await prisma.proxy.findMany({
            where: {
                absentTeacherId: teacherId as string,
                date: selectedDate
            },
            include: {
                assignedTeacher: true
            }
        });

        res.json({
            teacher: {
                id: teacher.id,
                name: teacher.name,
                employeeId: teacher.employeeId
            },
            date: date,
            dayOfWeek: adjustedDay,
            schedule,
            existingProxies
        });
    } catch (error) {
        console.error('Error fetching teacher schedule:', error);
        res.status(500).json({ error: 'Failed to fetch teacher schedule' });
    }
});

// GET /proxy/available-teachers - Get available teachers for a period
router.get('/available-teachers', async (req: Request, res: Response) => {
    try {
        const { date, periodId, excludeTeacherId } = req.query;

        if (!date || !periodId) {
            return res.status(400).json({ error: 'date and periodId are required' });
        }

        // Parse date and get day of week
        const selectedDate = new Date(date as string);
        const dayOfWeek = selectedDate.getDay();
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const dayEnum = DAY_TO_ENUM[adjustedDay];

        // Get all teachers who have a class during this period
        const busyTeachers = await prisma.timetable.findMany({
            where: {
                day: dayEnum,
                periodId: periodId as string
            },
            select: {
                teacherId: true
            }
        });

        const busyTeacherIds = busyTeachers.map(t => t.teacherId);

        // Get all teachers who already have a proxy assignment for this period
        const proxyTeachers = await prisma.proxy.findMany({
            where: {
                date: selectedDate,
                periodId: periodId as string
            },
            select: {
                assignedTeacherId: true
            }
        });

        const proxyTeacherIds = proxyTeachers.map(p => p.assignedTeacherId);

        // Combine all unavailable teacher IDs
        const unavailableIds = [...new Set([...busyTeacherIds, ...proxyTeacherIds])];

        // Add excluded teacher if provided
        if (excludeTeacherId) {
            unavailableIds.push(excludeTeacherId as string);
        }

        // Get all active teachers who are NOT busy
        const availableTeachers = await prisma.teacher.findMany({
            where: {
                isActive: true,
                id: {
                    notIn: unavailableIds
                }
            },
            select: {
                id: true,
                name: true,
                employeeId: true,
                phone: true
            }
        });

        // Calculate workload for each available teacher (classes + proxies for this date)
        const teachersWithLoad = await Promise.all(
            availableTeachers.map(async (teacher) => {
                // Count regular classes for this day
                const classCount = await prisma.timetable.count({
                    where: {
                        teacherId: teacher.id,
                        day: dayEnum
                    }
                });

                // Count proxy assignments for this date
                const proxyCount = await prisma.proxy.count({
                    where: {
                        assignedTeacherId: teacher.id,
                        date: selectedDate
                    }
                });

                return {
                    ...teacher,
                    currentLoad: classCount + proxyCount
                };
            })
        );

        // Sort by load (ascending - teachers with fewer classes first)
        teachersWithLoad.sort((a, b) => a.currentLoad - b.currentLoad);

        res.json({ availableTeachers: teachersWithLoad });
    } catch (error) {
        console.error('Error fetching available teachers:', error);
        res.status(500).json({ error: 'Failed to fetch available teachers' });
    }
});

// POST /proxy/assignments/bulk - Create multiple proxy assignments
router.post('/assignments/bulk', async (req: Request, res: Response) => {
    try {
        const { date, absentTeacherId, status, assignments, createdBy } = req.body;

        if (!date || !absentTeacherId || !status || !assignments || !Array.isArray(assignments)) {
            return res.status(400).json({ error: 'Invalid request body' });
        }

        // Parse date and get day of week
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();
        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Validate status
        const validStatuses = ['ABSENT', 'BUSY', 'HALF_DAY'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Create all proxy assignments
        const createdProxies = await Promise.all(
            assignments.map(async (assignment: any) => {
                const { periodId, proxyTeacherId, classId, subjectId, remarks } = assignment;

                // Verify proxy teacher is available
                const dayEnum = DAY_TO_ENUM[adjustedDay];
                const existingClass = await prisma.timetable.findFirst({
                    where: {
                        teacherId: proxyTeacherId,
                        day: dayEnum,
                        periodId
                    }
                });

                if (existingClass) {
                    throw new Error(`Teacher is already assigned to a class during this period`);
                }

                // Create proxy assignment
                return prisma.proxy.create({
                    data: {
                        date: selectedDate,
                        absentTeacherId,
                        status,
                        periodId,
                        classId,
                        subjectId,
                        assignedTeacherId: proxyTeacherId,
                        notes: remarks || null,
                        createdBy: createdBy || 'system', // Now just a string, no FK constraint
                        dayOfWeek: adjustedDay
                    } as any,
                    include: {
                        absentTeacher: true,
                        assignedTeacher: true,
                        class: true,
                        subject: true,
                        period: true
                    }
                });
            })
        );

        res.status(201).json({
            message: 'Proxy assignments created successfully',
            proxies: createdProxies
        });
    } catch (error: any) {
        console.error('Error creating proxy assignments:', error);
        res.status(500).json({ error: error.message || 'Failed to create proxy assignments' });
    }
});

// GET /proxy/assignments - Get proxy assignments for a teacher on a date
router.get('/assignments', async (req: Request, res: Response) => {
    try {
        const { date, teacherId } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'date is required' });
        }

        const selectedDate = new Date(date as string);

        const where: any = { date: selectedDate };
        if (teacherId) {
            where.absentTeacherId = teacherId as string;
        }

        const proxies = await prisma.proxy.findMany({
            where,
            include: {
                absentTeacher: true,
                assignedTeacher: true,
                class: true,
                subject: true,
                period: true
            },
            orderBy: {
                period: {
                    periodNo: 'asc'
                }
            }
        });

        res.json({ proxies });
    } catch (error) {
        console.error('Error fetching proxy assignments:', error);
        res.status(500).json({ error: 'Failed to fetch proxy assignments' });
    }
});

// DELETE /proxy/assignments/:id - Delete a proxy assignment
router.delete('/assignments/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.proxy.delete({
            where: { id }
        });

        res.json({ message: 'Proxy assignment deleted successfully' });
    } catch (error) {
        console.error('Error deleting proxy assignment:', error);
        res.status(500).json({ error: 'Failed to delete proxy assignment' });
    }
});

// GET /proxy/assignments/date/:date - Get all proxy assignments for a date
router.get('/assignments/date/:date', async (req: Request, res: Response) => {
    try {
        const { date } = req.params;
        const selectedDate = new Date(date);

        const proxies = await prisma.proxy.findMany({
            where: { date: selectedDate },
            include: {
                absentTeacher: true,
                assignedTeacher: true,
                class: true,
                subject: true,
                period: true
            },
            orderBy: [
                { absentTeacher: { name: 'asc' } },
                { period: { periodNo: 'asc' } }
            ]
        });

        res.json({ proxies });
    } catch (error) {
        console.error('Error fetching proxy assignments:', error);
        res.status(500).json({ error: 'Failed to fetch proxy assignments' });
    }
});

export default router;

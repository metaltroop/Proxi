import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Proxy history report
router.get('/proxy-history', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate, teacherId, classId, subjectId } = req.query;

        const where: any = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
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

        if (subjectId) {
            where.subjectId = subjectId;
        }

        const proxies = await prisma.proxy.findMany({
            where,
            include: {
                absentTeacher: { select: { name: true } },
                assignedTeacher: { select: { name: true } },
                class: { select: { className: true } },
                subject: { select: { subjectName: true, shortCode: true } },
                period: { select: { periodNo: true, startTime: true, endTime: true } },
                creator: { select: { name: true } }
            },
            orderBy: [
                { date: 'desc' },
                { period: { periodNo: 'asc' } }
            ]
        });

        res.json({ proxies });
    } catch (error) {
        console.error('Proxy history error:', error);
        res.status(500).json({ error: 'Failed to get proxy history' });
    }
});

// Teacher absence report
router.get('/teacher-absences', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const where: any = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        }

        const absences = await prisma.teacherAbsence.findMany({
            where,
            include: {
                teacher: { select: { name: true, email: true } }
            },
            orderBy: { date: 'desc' }
        });

        // Group by teacher
        const teacherStats: any = {};

        absences.forEach(absence => {
            const teacherId = absence.teacherId;
            if (!teacherStats[teacherId]) {
                teacherStats[teacherId] = {
                    teacherId,
                    teacherName: absence.teacher.name,
                    teacherEmail: absence.teacher.email,
                    totalAbsences: 0,
                    absenceDates: [],
                    reasons: {}
                };
            }

            teacherStats[teacherId].totalAbsences++;
            teacherStats[teacherId].absenceDates.push(absence.date);

            if (absence.reason) {
                teacherStats[teacherId].reasons[absence.reason] =
                    (teacherStats[teacherId].reasons[absence.reason] || 0) + 1;
            }
        });

        // Convert to array and find most common reason
        const stats = Object.values(teacherStats).map((stat: any) => {
            const reasonEntries = Object.entries(stat.reasons);
            const mostCommonReason = reasonEntries.length > 0
                ? reasonEntries.reduce((a: any, b: any) => a[1] > b[1] ? a : b)[0]
                : null;

            return {
                ...stat,
                mostCommonReason
            };
        });

        res.json({ stats });
    } catch (error) {
        console.error('Teacher absences error:', error);
        res.status(500).json({ error: 'Failed to get teacher absences' });
    }
});

// Proxy load report
router.get('/proxy-load', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const where: any = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        }

        const proxies = await prisma.proxy.findMany({
            where,
            include: {
                assignedTeacher: {
                    select: {
                        name: true,
                        timetables: true
                    }
                }
            }
        });

        // Group by assigned teacher
        const teacherLoad: any = {};

        proxies.forEach(proxy => {
            const teacherId = proxy.assignedTeacherId;
            if (!teacherLoad[teacherId]) {
                teacherLoad[teacherId] = {
                    teacherId,
                    teacherName: proxy.assignedTeacher.name,
                    regularPeriods: proxy.assignedTeacher.timetables.length,
                    proxyAssignments: 0,
                    totalLoad: 0,
                    loadPercentage: 0
                };
            }

            teacherLoad[teacherId].proxyAssignments++;
        });

        // Calculate totals and percentages
        const maxLoad = 40; // 8 periods * 5 days
        const stats = Object.values(teacherLoad).map((load: any) => {
            load.totalLoad = load.regularPeriods + load.proxyAssignments;
            load.loadPercentage = (load.totalLoad / maxLoad) * 100;
            return load;
        });

        res.json({ stats });
    } catch (error) {
        console.error('Proxy load error:', error);
        res.status(500).json({ error: 'Failed to get proxy load' });
    }
});

// Class coverage report
router.get('/class-coverage', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const where: any = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        }

        const proxies = await prisma.proxy.findMany({
            where,
            include: {
                class: { select: { className: true } }
            }
        });

        // Get all classes
        const classes = await prisma.class.findMany({
            where: { isActive: true },
            include: {
                timetables: true
            }
        });

        // Calculate coverage for each class
        const stats = classes.map(classData => {
            const totalPeriods = classData.timetables.length;
            const periodsWithProxy = proxies.filter(p => p.classId === classData.id).length;
            const periodsWithRegular = totalPeriods;
            const coveragePercentage = totalPeriods > 0
                ? ((periodsWithRegular / totalPeriods) * 100)
                : 100;

            return {
                classId: classData.id,
                className: classData.className,
                totalPeriods,
                periodsWithRegular,
                periodsWithProxy,
                periodsMissed: 0, // Would need additional tracking
                coveragePercentage
            };
        });

        res.json({ stats });
    } catch (error) {
        console.error('Class coverage error:', error);
        res.status(500).json({ error: 'Failed to get class coverage' });
    }
});

// Dashboard stats
router.get('/dashboard-stats', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Total teachers
        const totalTeachers = await prisma.teacher.count({
            where: { isActive: true }
        });

        // Teachers absent today
        const teachersAbsentToday = await prisma.teacherAbsence.count({
            where: { date: today }
        });

        // Proxies assigned today
        const proxiesAssignedToday = await prisma.proxy.count({
            where: { date: today }
        });

        // Recent proxy assignments (last 10)
        const recentProxies = await prisma.proxy.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                absentTeacher: { select: { name: true } },
                assignedTeacher: { select: { name: true } },
                class: { select: { className: true } },
                subject: { select: { shortCode: true } },
                period: { select: { periodNo: true } }
            }
        });

        res.json({
            totalTeachers,
            teachersAbsentToday,
            proxiesAssignedToday,
            recentProxies
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
});

export default router;

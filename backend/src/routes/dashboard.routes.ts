import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);
        const sevenDaysAgo = subDays(today, 6);

        // 1. Total Teachers
        const totalTeachers = await prisma.teacher.count({
            where: { isActive: true }
        });

        // 2. Teachers Absent Today
        // We check TeacherAbsence table for today
        const absentTeachersCount = await prisma.teacherAbsence.count({
            where: {
                date: {
                    gte: startOfToday,
                    lte: endOfToday
                }
            }
        });

        // 3. Proxies Assigned Today
        const proxiesTodayCount = await prisma.proxy.count({
            where: {
                date: {
                    gte: startOfToday,
                    lte: endOfToday
                }
            }
        });

        // 4. Proxy Trends (Last 7 Days)
        const proxiesLast7Days = await prisma.proxy.groupBy({
            by: ['date'],
            where: {
                date: {
                    gte: startOfDay(sevenDaysAgo),
                    lte: endOfToday
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                date: 'asc'
            }
        });

        // Format trends for frontend
        const proxyTrends = [];
        for (let i = 0; i < 7; i++) {
            const date = subDays(today, 6 - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const found = proxiesLast7Days.find(p => format(p.date, 'yyyy-MM-dd') === dateStr);
            proxyTrends.push({
                date: format(date, 'EEE'), // Mon, Tue
                count: found ? found._count.id : 0
            });
        }

        // 5. Recent Activity (Last 5 proxies)
        const recentProxies = await prisma.proxy.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                absentTeacher: { select: { name: true } },
                assignedTeacher: { select: { name: true } },
                class: { select: { className: true } },
                subject: { select: { shortCode: true } },
                period: { select: { periodNo: true } }
            }
        });

        // 6. Teacher Availability
        const teacherAvailability = [
            { name: 'Present', value: totalTeachers - absentTeachersCount, color: '#10B981' }, // Green
            { name: 'Absent', value: absentTeachersCount, color: '#EF4444' } // Red
        ];

        res.json({
            totalTeachers,
            teachersAbsentToday: absentTeachersCount,
            proxiesAssignedToday: proxiesTodayCount,
            proxyTrends,
            teacherAvailability,
            recentProxies
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

export default router;

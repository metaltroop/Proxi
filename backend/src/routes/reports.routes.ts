import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /reports/proxies - Get proxy assignments with filters
router.get('/proxies', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, teacherId } = req.query;

        const where: any = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        } else if (startDate) {
            where.date = {
                gte: new Date(startDate as string)
            };
        } else if (endDate) {
            where.date = {
                lte: new Date(endDate as string)
            };
        }

        if (teacherId) {
            // Search for proxies where the teacher was either absent OR assigned as proxy
            where.OR = [
                { absentTeacherId: teacherId as string },
                { assignedTeacherId: teacherId as string }
            ];
        }

        const proxies = await prisma.proxy.findMany({
            where,
            include: {
                absentTeacher: {
                    select: { name: true, employeeId: true }
                },
                assignedTeacher: {
                    select: { name: true, employeeId: true }
                },
                class: {
                    select: { className: true, standard: true, division: true }
                },
                subject: {
                    select: { subjectName: true, shortCode: true }
                },
                period: {
                    select: { periodNo: true, startTime: true, endTime: true }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        res.json({ proxies });
    } catch (error) {
        console.error('Error fetching proxy reports:', error);
        res.status(500).json({ error: 'Failed to fetch proxy reports' });
    }
});

// GET /reports/stats - Get summary statistics
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const dateFilter: any = {};
        if (startDate && endDate) {
            dateFilter.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        }

        // Total proxies in period
        const totalProxies = await prisma.proxy.count({
            where: dateFilter
        });

        // Most absent teachers
        const absentStats = await prisma.proxy.groupBy({
            by: ['absentTeacherId'],
            where: dateFilter,
            _count: {
                absentTeacherId: true
            },
            orderBy: {
                _count: {
                    absentTeacherId: 'desc'
                }
            },
            take: 5
        });

        // Most active proxies
        const proxyStats = await prisma.proxy.groupBy({
            by: ['assignedTeacherId'],
            where: dateFilter,
            _count: {
                assignedTeacherId: true
            },
            orderBy: {
                _count: {
                    assignedTeacherId: 'desc'
                }
            },
            take: 5
        });

        // Fetch teacher names for the stats
        const absentTeacherIds = absentStats.map(s => s.absentTeacherId);
        const proxyTeacherIds = proxyStats.map(s => s.assignedTeacherId);

        const teachers = await prisma.teacher.findMany({
            where: {
                id: { in: [...absentTeacherIds, ...proxyTeacherIds] }
            },
            select: { id: true, name: true }
        });

        const teacherMap = teachers.reduce((acc, t) => {
            acc[t.id] = t.name;
            return acc;
        }, {} as Record<string, string>);

        const formattedAbsentStats = absentStats.map(s => ({
            teacherId: s.absentTeacherId,
            name: teacherMap[s.absentTeacherId],
            count: s._count.absentTeacherId
        }));

        const formattedProxyStats = proxyStats.map(s => ({
            teacherId: s.assignedTeacherId,
            name: teacherMap[s.assignedTeacherId],
            count: s._count.assignedTeacherId
        }));

        res.json({
            totalProxies,
            mostAbsent: formattedAbsentStats,
            mostActiveProxies: formattedProxyStats
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// GET /reports/proxies/download-pdf - Download proxy report as PDF
router.get('/proxies/download-pdf', async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, teacherId } = req.query;

        const where: any = {};

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            };
        } else if (startDate) {
            where.date = {
                gte: new Date(startDate as string)
            };
        } else if (endDate) {
            where.date = {
                lte: new Date(endDate as string)
            };
        }

        if (teacherId) {
            where.OR = [
                { absentTeacherId: teacherId as string },
                { assignedTeacherId: teacherId as string }
            ];
        }

        const proxies = await prisma.proxy.findMany({
            where,
            include: {
                absentTeacher: {
                    select: { name: true, employeeId: true }
                },
                assignedTeacher: {
                    select: { name: true, employeeId: true }
                },
                class: {
                    select: { className: true, standard: true, division: true }
                },
                subject: {
                    select: { subjectName: true, shortCode: true }
                },
                period: {
                    select: { periodNo: true, startTime: true, endTime: true }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Generate PDF
        const { generateProxyReportPdf } = await import('../services/reportsPdfService');
        const pdfBuffer = await generateProxyReportPdf(
            proxies as any,
            startDate as string || new Date().toISOString().split('T')[0],
            endDate as string || new Date().toISOString().split('T')[0]
        );

        // Set response headers
        const filename = `proxy_report_${startDate || 'all'}_to_${endDate || 'all'}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF report' });
    }
});

export default router;

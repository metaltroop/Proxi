"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
const database_1 = __importDefault(require("../config/database"));
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = (0, date_fns_1.startOfDay)(today);
        const endOfToday = (0, date_fns_1.endOfDay)(today);
        const sevenDaysAgo = (0, date_fns_1.subDays)(today, 6);
        // Run all independent queries in parallel
        const [totalTeachers, absentTeachersCount, proxiesTodayCount, proxiesLast7Days, recentProxies] = await Promise.all([
            // 1. Total Teachers
            database_1.default.teacher.count({
                where: { isActive: true }
            }),
            // 2. Teachers Absent Today
            database_1.default.teacherAbsence.count({
                where: {
                    date: {
                        gte: startOfToday,
                        lte: endOfToday
                    }
                }
            }),
            // 3. Proxies Assigned Today
            database_1.default.proxy.count({
                where: {
                    date: {
                        gte: startOfToday,
                        lte: endOfToday
                    }
                }
            }),
            // 4. Proxy Trends (Last 7 Days)
            database_1.default.proxy.groupBy({
                by: ['date'],
                where: {
                    date: {
                        gte: (0, date_fns_1.startOfDay)(sevenDaysAgo),
                        lte: endOfToday
                    }
                },
                _count: {
                    id: true
                },
                orderBy: {
                    date: 'asc'
                }
            }),
            // 5. Recent Activity (Last 5 proxies)
            database_1.default.proxy.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    absentTeacher: { select: { name: true } },
                    assignedTeacher: { select: { name: true } },
                    class: { select: { className: true } },
                    subject: { select: { shortCode: true } },
                    period: { select: { periodNo: true } }
                }
            })
        ]);
        // Format trends for frontend
        const proxyTrends = [];
        for (let i = 0; i < 7; i++) {
            const date = (0, date_fns_1.subDays)(today, 6 - i);
            const dateStr = (0, date_fns_1.format)(date, 'yyyy-MM-dd');
            const found = proxiesLast7Days.find(p => (0, date_fns_1.format)(p.date, 'yyyy-MM-dd') === dateStr);
            proxyTrends.push({
                date: (0, date_fns_1.format)(date, 'EEE'), // Mon, Tue
                count: found ? found._count.id : 0
            });
        }
        // 6. Teacher Availability (derived from parallel results)
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
    }
    catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map
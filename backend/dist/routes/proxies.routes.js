"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const proxyAlgorithm_1 = require("../services/proxyAlgorithm");
const router = (0, express_1.Router)();
// Get all proxies with filters
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { date, teacherId, classId } = req.query;
        const where = {};
        if (date) {
            where.date = new Date(date);
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
        const proxies = await database_1.default.proxy.findMany({
            where,
            include: {
                absentTeacher: true,
                assignedTeacher: true,
                class: true,
                subject: true,
                period: true
            },
            orderBy: [
                { date: 'desc' },
                { period: { periodNo: 'asc' } }
            ]
        });
        res.json({ proxies });
    }
    catch (error) {
        console.error('Get proxies error:', error);
        res.status(500).json({ error: 'Failed to get proxies' });
    }
});
// Get single proxy
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const proxy = await database_1.default.proxy.findUnique({
            where: { id: req.params.id },
            include: {
                absentTeacher: true,
                assignedTeacher: true,
                class: true,
                subject: true,
                period: true
            }
        });
        if (!proxy) {
            return res.status(404).json({ error: 'Proxy not found' });
        }
        res.json({ proxy });
    }
    catch (error) {
        console.error('Get proxy error:', error);
        res.status(500).json({ error: 'Failed to get proxy' });
    }
});
// Get available teachers for a specific period
router.post('/available-teachers', auth_1.authenticate, async (req, res) => {
    try {
        const { date, periodId, subjectId, absentTeacherId } = req.body;
        const availableTeachers = await (0, proxyAlgorithm_1.getAvailableTeachers)(new Date(date), periodId, subjectId, absentTeacherId);
        res.json({ availableTeachers });
    }
    catch (error) {
        console.error('Get available teachers error:', error);
        res.status(500).json({ error: 'Failed to get available teachers' });
    }
});
// Auto-assign proxies for an absent teacher
router.post('/auto-assign', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { date, absentTeacherId } = req.body;
        const assignments = await (0, proxyAlgorithm_1.autoAssignProxies)(new Date(date), absentTeacherId);
        res.json({ assignments });
    }
    catch (error) {
        console.error('Auto-assign error:', error);
        res.status(500).json({ error: 'Failed to auto-assign proxies' });
    }
});
// Assign proxies (batch)
router.post('/assign', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { date, absentTeacherId, absenceReason, assignments, notes } = req.body;
        // Mark teacher as absent
        await database_1.default.teacherAbsence.upsert({
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
                markedBy: req.user.id
            },
            update: {
                reason: absenceReason
            }
        });
        // Create proxy assignments
        const proxies = await Promise.all(assignments.map((assignment) => database_1.default.proxy.create({
            data: {
                date: new Date(date),
                absentTeacherId,
                absenceReason,
                periodId: assignment.periodId,
                classId: assignment.classId,
                subjectId: assignment.subjectId,
                assignedTeacherId: assignment.assignedTeacherId,
                notes,
                createdBy: req.user.id,
                dayOfWeek: new Date(date).getDay(),
                status: 'ABSENT' // Default to absent for now
            },
            include: {
                absentTeacher: true,
                assignedTeacher: true,
                class: true,
                subject: true,
                period: true
            }
        })));
        res.status(201).json({
            message: 'Proxies assigned successfully',
            proxies
        });
    }
    catch (error) {
        console.error('Assign proxies error:', error);
        res.status(500).json({ error: 'Failed to assign proxies' });
    }
});
// Get teacher proxy load
router.get('/teacher-load/:teacherId', auth_1.authenticate, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {
            assignedTeacherId: req.params.teacherId
        };
        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const proxies = await database_1.default.proxy.findMany({
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
    }
    catch (error) {
        console.error('Get teacher load error:', error);
        res.status(500).json({ error: 'Failed to get teacher load' });
    }
});
// Delete proxy
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        await database_1.default.proxy.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Proxy deleted successfully' });
    }
    catch (error) {
        console.error('Delete proxy error:', error);
        res.status(500).json({ error: 'Failed to delete proxy' });
    }
});
exports.default = router;
//# sourceMappingURL=proxies.routes.js.map
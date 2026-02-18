"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const reportingClient_1 = require("../services/reportingClient");
const router = (0, express_1.Router)();
// Get timetable by query params (classId or teacherId)
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { classId, teacherId } = req.query;
        const where = {};
        if (classId)
            where.classId = classId;
        if (teacherId)
            where.teacherId = teacherId;
        const timetable = await database_1.default.timetable.findMany({
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
        const dayToNumber = {
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
    }
    catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({ error: 'Failed to get timetable' });
    }
});
// Download timetable PDF
router.get('/download-pdf', auth_1.authenticate, async (req, res) => {
    try {
        const { classId, teacherId } = req.query;
        if (!classId && !teacherId) {
            return res.status(400).json({ error: 'Class ID or Teacher ID is required' });
        }
        const where = {};
        if (classId)
            where.classId = classId;
        if (teacherId)
            where.teacherId = teacherId;
        const [timetable, periods, classData, teacherData] = await Promise.all([
            database_1.default.timetable.findMany({
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
            database_1.default.period.findMany({ orderBy: { periodNo: 'asc' } }),
            classId ? database_1.default.class.findUnique({ where: { id: classId } }) : Promise.resolve(null),
            teacherId ? database_1.default.teacher.findUnique({ where: { id: teacherId } }) : Promise.resolve(null)
        ]);
        let name = '';
        if (classId && classData) {
            name = `${classData.standard}${classData.division}`;
        }
        else if (teacherId && teacherData) {
            name = teacherData.name;
        }
        const pdfBuffer = await (0, reportingClient_1.getTimetablePdf)(timetable, periods, classId ? 'class' : 'teacher', name);
        const formattedName = name.replace(/[^a-zA-Z0-9]/g, '_');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${formattedName}_timetable.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Generate PDF error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});
router.get('/teacher/:teacherId', auth_1.authenticate, async (req, res) => {
    try {
        const timetable = await database_1.default.timetable.findMany({
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
    }
    catch (error) {
        console.error('Get teacher timetable error:', error);
        res.status(500).json({ error: 'Failed to get timetable' });
    }
});
// Get class timetable
router.get('/class/:classId', auth_1.authenticate, async (req, res) => {
    try {
        const timetable = await database_1.default.timetable.findMany({
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
    }
    catch (error) {
        console.error('Get class timetable error:', error);
        res.status(500).json({ error: 'Failed to get timetable' });
    }
});
// Create single timetable entry
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { teacherId, classId, subjectId, periodId, dayOfWeek } = req.body;
        // Map integer to DayOfWeek enum
        const dayMapping = [
            client_1.DayOfWeek.MONDAY,
            client_1.DayOfWeek.TUESDAY,
            client_1.DayOfWeek.WEDNESDAY,
            client_1.DayOfWeek.THURSDAY,
            client_1.DayOfWeek.FRIDAY,
            'SATURDAY'
        ];
        const entry = await database_1.default.timetable.create({
            data: {
                teacherId,
                classId,
                subjectId,
                periodId,
                day: dayMapping[dayOfWeek],
                createdBy: req.user.id
            },
            include: {
                class: true,
                teacher: true,
                subject: true,
                period: true
            }
        });
        res.status(201).json({ entry });
    }
    catch (error) {
        console.error('Create timetable error:', error);
        res.status(500).json({ error: 'Failed to create timetable entry' });
    }
});
// Update timetable entry
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { teacherId, classId, subjectId, periodId, dayOfWeek } = req.body;
        // Map integer to DayOfWeek enum
        const dayMapping = [
            client_1.DayOfWeek.MONDAY,
            client_1.DayOfWeek.TUESDAY,
            client_1.DayOfWeek.WEDNESDAY,
            client_1.DayOfWeek.THURSDAY,
            client_1.DayOfWeek.FRIDAY,
            'SATURDAY'
        ];
        const entry = await database_1.default.timetable.update({
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
    }
    catch (error) {
        console.error('Update timetable error:', error);
        res.status(500).json({ error: 'Failed to update timetable entry' });
    }
});
// Delete timetable entry
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        await database_1.default.timetable.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Timetable entry deleted successfully' });
    }
    catch (error) {
        console.error('Delete timetable error:', error);
        res.status(500).json({ error: 'Failed to delete timetable entry' });
    }
});
// Check for conflicts
router.post('/conflicts', auth_1.authenticate, async (req, res) => {
    try {
        const { teacherId, classId, day, periodId } = req.body;
        const conflicts = [];
        // Check teacher conflict
        if (teacherId) {
            const teacherConflict = await database_1.default.timetable.findFirst({
                where: {
                    teacherId,
                    day: day,
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
            const classConflict = await database_1.default.timetable.findFirst({
                where: {
                    classId,
                    day: day,
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
    }
    catch (error) {
        console.error('Check conflicts error:', error);
        res.status(500).json({ error: 'Failed to check conflicts' });
    }
});
// Download bulk timetable PDF
router.post('/download-bulk-pdf', auth_1.authenticate, async (req, res) => {
    try {
        const { classIds, teacherIds } = req.body;
        if ((!classIds || classIds.length === 0) && (!teacherIds || teacherIds.length === 0)) {
            return res.status(400).json({ error: 'classIds or teacherIds must be provided' });
        }
        const periods = await database_1.default.period.findMany();
        const items = [];
        // Fetch Class Timetables
        if (classIds && classIds.length > 0) {
            const classes = await database_1.default.class.findMany({
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
            const teachers = await database_1.default.teacher.findMany({
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
        const pdfBuffer = await (0, reportingClient_1.getBulkTimetablePdf)({ items, periods });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="timetables_bulk.pdf"');
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('Download bulk PDF error:', error);
        res.status(500).json({ error: 'Failed to download bulk PDF' });
    }
});
exports.default = router;
//# sourceMappingURL=timetables.routes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Get all teachers with filters
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { search, isClassTeacher, standard, subject } = req.query;
        const where = { isActive: true };
        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } }
            ];
        }
        // Class teacher filter
        if (isClassTeacher !== undefined) {
            where.isClassTeacher = isClassTeacher === 'true';
        }
        const teachers = await database_1.default.teacher.findMany({
            where,
            include: {
                assignedClass: true
            },
            orderBy: { name: 'asc' }
        });
        // Filter by standard if provided
        let filteredTeachers = teachers;
        if (standard) {
            filteredTeachers = teachers.filter((t) => t.assignedClass?.standard === parseInt(standard));
        }
        // Filter by subject if provided
        if (subject) {
            filteredTeachers = filteredTeachers.filter((t) => {
                const subjects = t.teachingSubjects;
                return subjects && Array.isArray(subjects) && subjects.includes(subject);
            });
        }
        res.json({ teachers: filteredTeachers });
    }
    catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ error: 'Failed to get teachers' });
    }
});
// Get single teacher
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const teacher = await database_1.default.teacher.findUnique({
            where: { id: req.params.id },
            include: {
                assignedClass: true,
                timetables: {
                    include: {
                        class: true,
                        subject: true,
                        period: true
                    }
                }
            }
        });
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json({ teacher });
    }
    catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({ error: 'Failed to get teacher' });
    }
});
// Create teacher
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { name, email, phone, employeeId, isClassTeacher, assignedClassId, teachingSubjects, joinDate } = req.body;
        const teacher = await database_1.default.teacher.create({
            data: {
                name,
                email: email || null,
                phone,
                employeeId: employeeId || null,
                isClassTeacher: isClassTeacher || false,
                assignedClassId: assignedClassId && assignedClassId !== '' ? assignedClassId : null,
                teachingSubjects: teachingSubjects || [],
                joinDate: joinDate ? new Date(joinDate) : null
            },
            include: {
                assignedClass: true
            }
        });
        // Update class with class teacher if applicable
        if (isClassTeacher && assignedClassId && assignedClassId !== '') {
            await database_1.default.class.update({
                where: { id: assignedClassId },
                data: { classTeacherId: teacher.id }
            });
        }
        res.status(201).json({ teacher });
    }
    catch (error) {
        console.error('Create teacher error:', error);
        res.status(500).json({ error: 'Failed to create teacher' });
    }
});
// Update teacher
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { name, email, phone, employeeId, isClassTeacher, assignedClassId, teachingSubjects, joinDate } = req.body;
        const teacher = await database_1.default.teacher.update({
            where: { id: req.params.id },
            data: {
                name,
                email: email || null,
                phone,
                employeeId: employeeId || null,
                isClassTeacher,
                assignedClassId: assignedClassId && assignedClassId !== '' ? assignedClassId : null,
                teachingSubjects,
                joinDate: joinDate ? new Date(joinDate) : null
            },
            include: {
                assignedClass: true
            }
        });
        res.json({ teacher });
    }
    catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({ error: 'Failed to update teacher' });
    }
});
// Delete teacher (soft delete)
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        await database_1.default.teacher.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });
        res.json({ message: 'Teacher deleted successfully' });
    }
    catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({ error: 'Failed to delete teacher' });
    }
});
// Mark teacher absent/present
router.put('/:id/absence', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { date, reason, isAbsent } = req.body;
        if (isAbsent) {
            // Mark absent
            await database_1.default.teacherAbsence.upsert({
                where: {
                    teacherId_date: {
                        teacherId: req.params.id,
                        date: new Date(date)
                    }
                },
                create: {
                    teacherId: req.params.id,
                    date: new Date(date),
                    reason,
                    markedBy: req.user.id
                },
                update: {
                    reason
                }
            });
        }
        else {
            // Remove absence
            await database_1.default.teacherAbsence.delete({
                where: {
                    teacherId_date: {
                        teacherId: req.params.id,
                        date: new Date(date)
                    }
                }
            }).catch(() => { }); // Ignore if doesn't exist
        }
        res.json({ message: 'Absence status updated' });
    }
    catch (error) {
        console.error('Update absence error:', error);
        res.status(500).json({ error: 'Failed to update absence status' });
    }
});
// Get teacher timetable
router.get('/:id/timetable', auth_1.authenticate, async (req, res) => {
    try {
        const timetable = await database_1.default.timetable.findMany({
            where: { teacherId: req.params.id },
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
        console.error('Get timetable error:', error);
        res.status(500).json({ error: 'Failed to get timetable' });
    }
});
// Copy schedule from another teacher
router.post('/copy-schedule', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { fromTeacherId, toTeacherId } = req.body;
        // Get source teacher's timetable
        const sourceTimetable = await database_1.default.timetable.findMany({
            where: { teacherId: fromTeacherId }
        });
        // Get source teacher's subjects
        const sourceTeacher = await database_1.default.teacher.findUnique({
            where: { id: fromTeacherId },
            select: { teachingSubjects: true }
        });
        // Update target teacher's subjects
        await database_1.default.teacher.update({
            where: { id: toTeacherId },
            data: { teachingSubjects: sourceTeacher?.teachingSubjects }
        });
        // Copy timetable entries
        const newEntries = sourceTimetable.map((entry) => ({
            teacherId: toTeacherId,
            classId: entry.classId,
            subjectId: entry.subjectId,
            day: entry.day,
            periodId: entry.periodId,
            createdBy: req.user.id
        }));
        await database_1.default.timetable.createMany({
            data: newEntries,
            skipDuplicates: true
        });
        res.json({ message: 'Schedule copied successfully' });
    }
    catch (error) {
        console.error('Copy schedule error:', error);
        res.status(500).json({ error: 'Failed to copy schedule' });
    }
});
exports.default = router;
//# sourceMappingURL=teachers.routes.js.map
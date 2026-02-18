"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const router = (0, express_1.Router)();
// Get all classes with filters
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { search, standard } = req.query;
        const where = { isActive: true };
        if (search) {
            where.OR = [
                { className: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (standard) {
            where.standard = parseInt(standard);
        }
        const classes = await database_1.default.class.findMany({
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
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Get classes');
    }
});
// Get single class
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const classData = await database_1.default.class.findUnique({
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
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Get class');
    }
});
// Bulk create classes
router.post('/bulk', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
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
        const result = await database_1.default.class.createMany({
            data: classesToCreate,
            skipDuplicates: true
        });
        res.status(201).json({
            message: `Created ${result.count} classes`,
            count: result.count
        });
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Bulk create classes');
    }
});
// Update class
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { className, classTeacherId, numberOfStudents } = req.body;
        // Get the current class to check if class teacher is changing
        const currentClass = await database_1.default.class.findUnique({
            where: { id: req.params.id }
        });
        // If there was a previous class teacher, unassign them
        if (currentClass?.classTeacherId && currentClass.classTeacherId !== classTeacherId) {
            await database_1.default.teacher.update({
                where: { id: currentClass.classTeacherId },
                data: {
                    isClassTeacher: false,
                    assignedClassId: null
                }
            });
        }
        // Update the class
        const classData = await database_1.default.class.update({
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
            await database_1.default.teacher.update({
                where: { id: classTeacherId },
                data: {
                    isClassTeacher: true,
                    assignedClassId: req.params.id
                }
            });
        }
        res.json({ class: classData });
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Update class');
    }
});
// Delete class (soft delete)
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        await database_1.default.class.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });
        res.json({ message: 'Class deleted successfully' });
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Delete class');
    }
});
// Get class timetable
router.get('/:id/timetable', auth_1.authenticate, async (req, res) => {
    try {
        const timetable = await database_1.default.timetable.findMany({
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
    }
    catch (error) {
        (0, errorHandler_1.handleRouteError)(res, error, 'Get timetable');
    }
});
exports.default = router;
//# sourceMappingURL=classes.routes.js.map
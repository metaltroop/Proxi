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
// Get all subjects
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const subjects = await database_1.default.subject.findMany({
            where: { isActive: true },
            orderBy: { subjectName: 'asc' }
        });
        res.json({ subjects });
    }
    catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ error: 'Failed to get subjects' });
    }
});
// Get single subject
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const subject = await database_1.default.subject.findUnique({
            where: { id: req.params.id }
        });
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json({ subject });
    }
    catch (error) {
        console.error('Get subject error:', error);
        res.status(500).json({ error: 'Failed to get subject' });
    }
});
// Create subject
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { subjectName, shortCode, colorCode, standardsApplicable } = req.body;
        const subject = await database_1.default.subject.create({
            data: {
                subjectName,
                shortCode,
                colorCode,
                standardsApplicable: standardsApplicable || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            }
        });
        res.status(201).json({ subject });
    }
    catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ error: 'Failed to create subject' });
    }
});
// Update subject
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN, client_1.UserRole.COORDINATOR), async (req, res) => {
    try {
        const { subjectName, shortCode, colorCode, standardsApplicable } = req.body;
        const subject = await database_1.default.subject.update({
            where: { id: req.params.id },
            data: {
                subjectName,
                shortCode,
                colorCode,
                standardsApplicable
            }
        });
        res.json({ subject });
    }
    catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ error: 'Failed to update subject' });
    }
});
// Delete subject (soft delete)
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(client_1.UserRole.ADMIN), async (req, res) => {
    try {
        await database_1.default.subject.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });
        res.json({ message: 'Subject deleted successfully' });
    }
    catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});
exports.default = router;
//# sourceMappingURL=subjects.routes.js.map
import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Get all subjects
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: { isActive: true },
            orderBy: { subjectName: 'asc' }
        });

        res.json({ subjects });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ error: 'Failed to get subjects' });
    }
});

// Get single subject
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const subject = await prisma.subject.findUnique({
            where: { id: req.params.id }
        });

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json({ subject });
    } catch (error) {
        console.error('Get subject error:', error);
        res.status(500).json({ error: 'Failed to get subject' });
    }
});

// Create subject
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { subjectName, shortCode, colorCode, standardsApplicable } = req.body;

        const subject = await prisma.subject.create({
            data: {
                subjectName,
                shortCode,
                colorCode,
                standardsApplicable: standardsApplicable || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            }
        });

        res.status(201).json({ subject });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ error: 'Failed to create subject' });
    }
});

// Update subject
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { subjectName, shortCode, colorCode, standardsApplicable } = req.body;

        const subject = await prisma.subject.update({
            where: { id: req.params.id },
            data: {
                subjectName,
                shortCode,
                colorCode,
                standardsApplicable
            }
        });

        res.json({ subject });
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ error: 'Failed to update subject' });
    }
});

// Delete subject (soft delete)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
    try {
        await prisma.subject.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });

        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});

export default router;

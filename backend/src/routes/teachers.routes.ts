import { Router, Response } from 'express';
import prisma from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Get all teachers with filters
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { search, isClassTeacher, standard, subject } = req.query;

        const where: any = { isActive: true };

        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
                { phone: { contains: search as string } }
            ];
        }

        // Class teacher filter
        if (isClassTeacher !== undefined) {
            where.isClassTeacher = isClassTeacher === 'true';
        }

        const teachers = await prisma.teacher.findMany({
            where,
            include: {
                assignedClass: true
            },
            orderBy: { name: 'asc' }
        });

        // Filter by standard if provided
        let filteredTeachers = teachers;
        if (standard) {
            filteredTeachers = teachers.filter(t =>
                t.assignedClass?.standard === parseInt(standard as string)
            );
        }

        // Filter by subject if provided
        if (subject) {
            filteredTeachers = filteredTeachers.filter(t => {
                const subjects = t.teachingSubjects as any;
                return subjects && Array.isArray(subjects) && subjects.includes(subject);
            });
        }

        res.json({ teachers: filteredTeachers });
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ error: 'Failed to get teachers' });
    }
});

// Get single teacher
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const teacher = await prisma.teacher.findUnique({
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
    } catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({ error: 'Failed to get teacher' });
    }
});

// Create teacher
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, phone, employeeId, isClassTeacher, assignedClassId, teachingSubjects, joinDate } = req.body;

        const teacher = await prisma.teacher.create({
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
            await prisma.class.update({
                where: { id: assignedClassId },
                data: { classTeacherId: teacher.id }
            });
        }

        res.status(201).json({ teacher });
    } catch (error) {
        console.error('Create teacher error:', error);
        res.status(500).json({ error: 'Failed to create teacher' });
    }
});

// Update teacher
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, phone, employeeId, isClassTeacher, assignedClassId, teachingSubjects, joinDate } = req.body;

        const teacher = await prisma.teacher.update({
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
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({ error: 'Failed to update teacher' });
    }
});

// Delete teacher (soft delete)
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response) => {
    try {
        await prisma.teacher.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });

        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({ error: 'Failed to delete teacher' });
    }
});

// Mark teacher absent/present
router.put('/:id/absence', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { date, reason, isAbsent } = req.body;

        if (isAbsent) {
            // Mark absent
            await prisma.teacherAbsence.upsert({
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
                    markedBy: req.user!.id
                },
                update: {
                    reason
                }
            });
        } else {
            // Remove absence
            await prisma.teacherAbsence.delete({
                where: {
                    teacherId_date: {
                        teacherId: req.params.id,
                        date: new Date(date)
                    }
                }
            }).catch(() => { }); // Ignore if doesn't exist
        }

        res.json({ message: 'Absence status updated' });
    } catch (error) {
        console.error('Update absence error:', error);
        res.status(500).json({ error: 'Failed to update absence status' });
    }
});

// Get teacher timetable
router.get('/:id/timetable', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const timetable = await prisma.timetable.findMany({
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
    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({ error: 'Failed to get timetable' });
    }
});

// Copy schedule from another teacher
router.post('/copy-schedule', authenticate, authorize(UserRole.ADMIN, UserRole.COORDINATOR), async (req: AuthRequest, res: Response) => {
    try {
        const { fromTeacherId, toTeacherId } = req.body;

        // Get source teacher's timetable
        const sourceTimetable = await prisma.timetable.findMany({
            where: { teacherId: fromTeacherId }
        });

        // Get source teacher's subjects
        const sourceTeacher = await prisma.teacher.findUnique({
            where: { id: fromTeacherId },
            select: { teachingSubjects: true }
        });

        // Update target teacher's subjects
        await prisma.teacher.update({
            where: { id: toTeacherId },
            data: { teachingSubjects: sourceTeacher?.teachingSubjects }
        });

        // Copy timetable entries
        const newEntries = sourceTimetable.map(entry => ({
            teacherId: toTeacherId,
            classId: entry.classId,
            subjectId: entry.subjectId,
            day: entry.day,
            periodId: entry.periodId,
            createdBy: req.user!.id
        }));

        await prisma.timetable.createMany({
            data: newEntries,
            skipDuplicates: true
        });

        res.json({ message: 'Schedule copied successfully' });
    } catch (error) {
        console.error('Copy schedule error:', error);
        res.status(500).json({ error: 'Failed to copy schedule' });
    }
});

export default router;

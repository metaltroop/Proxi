import prisma from './config/database';
import bcrypt from 'bcryptjs';
import { UserRole, PeriodType } from '@prisma/client';

async function main() {
    console.log('🌱 Seeding database...');

    // Create users
    const users = [
        {
            email: 'superuser@ssa.com',
            password: await bcrypt.hash('ChangeMe@123', 10),
            role: UserRole.ADMIN,
            name: 'Super User'
        },
        {
            email: 'coordinatorA@ssa.com',
            password: await bcrypt.hash('ChangeMe@123', 10),
            role: UserRole.COORDINATOR,
            name: 'Coordinator A'
        },
        {
            email: 'coordinatorB@ssa.com',
            password: await bcrypt.hash('ChangeMe@123', 10),
            role: UserRole.COORDINATOR,
            name: 'Coordinator B'
        },
        {
            email: 'principal@ssa.com',
            password: await bcrypt.hash('ChangeMe@123', 10),
            role: UserRole.PRINCIPAL,
            name: 'Principal'
        }
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user
        });
    }
    console.log('✅ Created 4 users');

    // Create subjects
    const subjects = [
        { subjectName: 'English', shortCode: 'ENG', colorCode: '#3B82F6', standardsApplicable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { subjectName: 'Hindi', shortCode: 'HIN', colorCode: '#EF4444', standardsApplicable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { subjectName: 'Mathematics', shortCode: 'MATH', colorCode: '#10B981', standardsApplicable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { subjectName: 'Science', shortCode: 'SCI', colorCode: '#F59E0B', standardsApplicable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { subjectName: 'Social Studies', shortCode: 'SST', colorCode: '#8B5CF6', standardsApplicable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { subjectName: 'Computer Science', shortCode: 'CS', colorCode: '#06B6D4', standardsApplicable: [6, 7, 8, 9, 10] },
        { subjectName: 'Physical Education', shortCode: 'PE', colorCode: '#EC4899', standardsApplicable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { subjectName: 'Art', shortCode: 'ART', colorCode: '#F97316', standardsApplicable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        { subjectName: 'Music', shortCode: 'MUS', colorCode: '#84CC16', standardsApplicable: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
    ];

    for (const subject of subjects) {
        await prisma.subject.upsert({
            where: { shortCode: subject.shortCode },
            update: {},
            create: subject
        });
    }
    console.log('✅ Created 9 subjects');

    // Create periods
    const periods = [
        { periodNo: 1, periodType: PeriodType.CLASS, startTime: '08:00', endTime: '08:45' },
        { periodNo: 2, periodType: PeriodType.CLASS, startTime: '08:45', endTime: '09:30' },
        { periodNo: 3, periodType: PeriodType.RECESS, startTime: '09:30', endTime: '09:50' },
        { periodNo: 4, periodType: PeriodType.CLASS, startTime: '09:50', endTime: '10:35' },
        { periodNo: 5, periodType: PeriodType.CLASS, startTime: '10:35', endTime: '11:20' },
        { periodNo: 6, periodType: PeriodType.LUNCH, startTime: '11:20', endTime: '12:00' },
        { periodNo: 7, periodType: PeriodType.CLASS, startTime: '12:00', endTime: '12:45' },
        { periodNo: 8, periodType: PeriodType.CLASS, startTime: '12:45', endTime: '13:30' }
    ];

    for (const period of periods) {
        await prisma.period.upsert({
            where: { periodNo: period.periodNo },
            update: {},
            create: period
        });
    }
    console.log('✅ Created 8 periods');

    console.log('🎉 Seeding completed!');
    console.log('\n📧 Default login credentials:');
    console.log('   superuser@ssa.com / ChangeMe@123');
    console.log('   coordinatorA@ssa.com / ChangeMe@123');
    console.log('   coordinatorB@ssa.com / ChangeMe@123');
    console.log('   principal@ssa.com / ChangeMe@123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

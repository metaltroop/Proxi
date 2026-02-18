"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
async function main() {
    console.log('🌱 Seeding database...');
    // Create users
    const users = [
        {
            email: 'superuser@ssa.com',
            password: await bcryptjs_1.default.hash('ChangeMe@123', 10),
            role: client_1.UserRole.ADMIN,
            name: 'Super User'
        },
        {
            email: 'coordinatorA@ssa.com',
            password: await bcryptjs_1.default.hash('ChangeMe@123', 10),
            role: client_1.UserRole.COORDINATOR,
            name: 'Coordinator A'
        },
        {
            email: 'coordinatorB@ssa.com',
            password: await bcryptjs_1.default.hash('ChangeMe@123', 10),
            role: client_1.UserRole.COORDINATOR,
            name: 'Coordinator B'
        },
        {
            email: 'principal@ssa.com',
            password: await bcryptjs_1.default.hash('ChangeMe@123', 10),
            role: client_1.UserRole.PRINCIPAL,
            name: 'Principal'
        }
    ];
    for (const user of users) {
        await database_1.default.user.upsert({
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
        await database_1.default.subject.upsert({
            where: { shortCode: subject.shortCode },
            update: {},
            create: subject
        });
    }
    console.log('✅ Created 9 subjects');
    // Create periods
    const periods = [
        { periodNo: 1, periodType: client_1.PeriodType.CLASS, startTime: '08:00', endTime: '08:45' },
        { periodNo: 2, periodType: client_1.PeriodType.CLASS, startTime: '08:45', endTime: '09:30' },
        { periodNo: 3, periodType: client_1.PeriodType.RECESS, startTime: '09:30', endTime: '09:50' },
        { periodNo: 4, periodType: client_1.PeriodType.CLASS, startTime: '09:50', endTime: '10:35' },
        { periodNo: 5, periodType: client_1.PeriodType.CLASS, startTime: '10:35', endTime: '11:20' },
        { periodNo: 6, periodType: client_1.PeriodType.LUNCH, startTime: '11:20', endTime: '12:00' },
        { periodNo: 7, periodType: client_1.PeriodType.CLASS, startTime: '12:00', endTime: '12:45' },
        { periodNo: 8, periodType: client_1.PeriodType.CLASS, startTime: '12:45', endTime: '13:30' }
    ];
    for (const period of periods) {
        await database_1.default.period.upsert({
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
    await database_1.default.$disconnect();
});
//# sourceMappingURL=seed.js.map
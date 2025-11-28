import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    const password = await bcrypt.hash('ChangeMe@123', 10);

    // Superuser
    const superuser = await prisma.user.upsert({
        where: { email: 'kalepiyush02@gmail.com' },
        update: {},
        create: {
            email: 'kalepiyush02@gmail.com',
            name: 'Piyush Kale (Admin)',
            password,
            role: UserRole.ADMIN,
        },
    });
    console.log(`Created/Updated superuser: ${superuser.email}`);

    // Coordinator
    const coordinator = await prisma.user.upsert({
        where: { email: 'kalepiyush003@gmail.com' },
        update: {},
        create: {
            email: 'kalepiyush003@gmail.com',
            name: 'Piyush Kale (Coordinator)',
            password,
            role: UserRole.COORDINATOR,
        },
    });
    console.log(`Created/Updated coordinator: ${coordinator.email}`);

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

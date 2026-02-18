import { Response } from 'express';
import { Prisma } from '@prisma/client';

export const handleRouteError = (res: Response, error: any, context: string) => {
    // Check for Common Prisma Connection Errors
    if (
        error.code === 'P1001' ||
        error.name === 'PrismaClientInitializationError' ||
        (error.message && error.message.includes('Can\'t reach database server'))
    ) {
        console.error(`\n❌ [${context}] Database Connection Error: Unable to reach the database server.`);
        console.error('   Please check your internet connection or the status of your Neon DB.');
    } else {
        // Log brief error for other Prisma errors
        console.error(`\n❌ [${context}] Unexpected Error:`, error.message || error);
    }

    // Send response if not already sent
    if (!res.headersSent) {
        res.status(500).json({
            error: error.code === 'P1001'
                ? 'Service temporarily unavailable. Please try again later.'
                : `Failed to process request: ${context}`
        });
    }
};

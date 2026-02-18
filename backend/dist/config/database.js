"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
const prisma = prismaClient.$extends({
    query: {
        $allModels: {
            async $allOperations({ operation, model, args, query }) {
                const MAX_RETRIES = 3;
                const RETRY_DELAY = 1000; // 1 second
                let retries = 0;
                while (retries < MAX_RETRIES) {
                    try {
                        return await query(args);
                    }
                    catch (error) {
                        // Check for connection errors (P1001: Can't reach database server)
                        // or other transient errors if needed
                        if ((error.code === 'P1001' || error.message?.includes('Can\'t reach database server')) &&
                            retries < MAX_RETRIES - 1) {
                            console.warn(`Database connection failed. Retrying... (${retries + 1}/${MAX_RETRIES})`);
                            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                            retries++;
                        }
                        else {
                            throw error;
                        }
                    }
                }
            },
        },
    },
});
exports.default = prisma;
//# sourceMappingURL=database.js.map
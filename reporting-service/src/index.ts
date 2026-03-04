import express from 'express';
import cors from 'cors';
import reportsRoutes from './routes/reports.routes';
import dotenv from 'dotenv';
dotenv.config();

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

const app = express();
const PORT = process.env.PORT || 3001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large JSON payloads

// Routes
app.use('/reports', reportsRoutes);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the status of the reporting service
 *     responses:
 *       200:
 *         description: Reporting service is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: reporting-service
 */
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'reporting-service' });
});

app.listen(PORT, () => {
    console.log(`Reporting Service running on port ${PORT}`);

    // Internal Keep-Alive: Ping Backend Service every 5 minutes
    setInterval(async () => {
        try {
            await fetch(`${BACKEND_URL}/health`);
            // console.log('Pinged Backend Service to keep alive');
        } catch (error) {
            console.error('Failed to ping Backend Service');
        }
    }, 5 * 60 * 1000);
});

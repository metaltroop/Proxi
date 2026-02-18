import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import teacherRoutes from './routes/teachers.routes';
import classRoutes from './routes/classes.routes';
import subjectRoutes from './routes/subjects.routes';
import periodRoutes from './routes/periods.routes';
import timetableRoutes from './routes/timetables.routes';
import proxyRoutes from './routes/proxy.routes';
import reportRoutes from './routes/reports.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5174',
        'http://localhost:5173',
        'http://10.151.216.220:5173',
        'capacitor://localhost',
        'http://192.168.1.63:5173',
        'http://localhost'
    ],
    credentials: true,
    exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Proxi API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Proxi API server running on http://localhost:${PORT}`);

    // Internal Keep-Alive: Ping Reporting Service every 5 minutes
    const REPORTING_SERVICE_URL = process.env.REPORTING_SERVICE_URL || 'http://localhost:3001';
    setInterval(async () => {
        try {
            await fetch(`${REPORTING_SERVICE_URL}/health`);
            // console.log('Pinged Reporting Service to keep alive');
        } catch (error) {
            console.error('Failed to ping Reporting Service');
        }
    }, 2 * 60 * 1000);
});

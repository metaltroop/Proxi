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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5174',
        'http://localhost:5173',
        'http://10.179.54.220:5173'
    ],
    credentials: true
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
});

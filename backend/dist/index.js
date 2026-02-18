"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const teachers_routes_1 = __importDefault(require("./routes/teachers.routes"));
const classes_routes_1 = __importDefault(require("./routes/classes.routes"));
const subjects_routes_1 = __importDefault(require("./routes/subjects.routes"));
const periods_routes_1 = __importDefault(require("./routes/periods.routes"));
const timetables_routes_1 = __importDefault(require("./routes/timetables.routes"));
const proxy_routes_1 = __importDefault(require("./routes/proxy.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)({
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
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/teachers', teachers_routes_1.default);
app.use('/api/classes', classes_routes_1.default);
app.use('/api/subjects', subjects_routes_1.default);
app.use('/api/periods', periods_routes_1.default);
app.use('/api/timetables', timetables_routes_1.default);
app.use('/api/proxy', proxy_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Proxi API is running' });
});
// Error handling middleware
app.use((err, req, res, next) => {
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
        }
        catch (error) {
            console.error('Failed to ping Reporting Service');
        }
    }, 2 * 60 * 1000);
});
//# sourceMappingURL=index.js.map
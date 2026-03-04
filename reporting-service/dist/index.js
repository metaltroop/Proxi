"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' })); // Increase limit for large JSON payloads
// Routes
app.use('/reports', reports_routes_1.default);
// Swagger Documentation Route
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
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
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fetch(`${BACKEND_URL}/health`);
            // console.log('Pinged Backend Service to keep alive');
        }
        catch (error) {
            console.error('Failed to ping Backend Service');
        }
    }), 5 * 60 * 1000);
});

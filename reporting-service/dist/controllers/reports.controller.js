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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBulkTimetable = exports.generateTimetable = exports.generateProxyReport = void 0;
const reportsPdfService_1 = require("../services/reportsPdfService");
const pdfService_1 = require("../services/pdfService");
const generateProxyReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { proxies, startDate, endDate } = req.body;
        if (!proxies) {
            return res.status(400).json({ error: 'Missing proxies data' });
        }
        const pdfBuffer = yield (0, reportsPdfService_1.generateProxyReportPdf)(proxies, startDate, endDate);
        const pdfBase64 = pdfBuffer.toString('base64');
        res.json({ pdfBase64 });
    }
    catch (error) {
        console.error('Error generating proxy report PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});
exports.generateProxyReport = generateProxyReport;
const generateTimetable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { timetable, periods, type, name } = req.body;
        if (!timetable || !periods || !type || !name) {
            return res.status(400).json({ error: 'Missing required fields: timetable, periods, type, or name' });
        }
        const pdfBuffer = yield (0, pdfService_1.generateTimetablePdf)(timetable, periods, type, name);
        const pdfBase64 = pdfBuffer.toString('base64');
        res.json({ pdfBase64 });
    }
    catch (error) {
        console.error('Error generating timetable PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});
exports.generateTimetable = generateTimetable;
const generateBulkTimetable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { items, periods } = req.body;
        if (!items || !periods || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Missing required fields: items (array) and periods' });
        }
        const pdfBuffer = yield (0, pdfService_1.generateBulkTimetablePdf)(items, periods);
        const pdfBase64 = pdfBuffer.toString('base64');
        res.json({ pdfBase64 });
    }
    catch (error) {
        console.error('Error generating bulk timetable PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});
exports.generateBulkTimetable = generateBulkTimetable;

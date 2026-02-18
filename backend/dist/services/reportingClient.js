"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBulkTimetablePdf = exports.getProxyReportPdf = exports.getTimetablePdf = void 0;
const REPORTING_SERVICE_URL = process.env.REPORTING_SERVICE_URL || 'http://localhost:3001';
const getTimetablePdf = async (timetable, periods, type, name) => {
    try {
        const response = await fetch(`${REPORTING_SERVICE_URL}/reports/timetable`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                timetable,
                periods,
                type,
                name
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Reporting service failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    catch (error) {
        console.error('Error fetching timetable PDF from reporting service:', error);
        throw error;
    }
};
exports.getTimetablePdf = getTimetablePdf;
const getProxyReportPdf = async (proxies, startDate, endDate) => {
    try {
        const response = await fetch(`${REPORTING_SERVICE_URL}/reports/proxy-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                proxies,
                startDate,
                endDate
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Reporting service failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    catch (error) {
        console.error('Error fetching proxy report PDF from reporting service:', error);
        throw error;
    }
};
exports.getProxyReportPdf = getProxyReportPdf;
const getBulkTimetablePdf = async (payload) => {
    try {
        const response = await fetch(`${REPORTING_SERVICE_URL}/reports/bulk-timetable`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Reporting service failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    catch (error) {
        console.error('Error fetching bulk timetable PDF from reporting service:', error);
        throw error;
    }
};
exports.getBulkTimetablePdf = getBulkTimetablePdf;
//# sourceMappingURL=reportingClient.js.map
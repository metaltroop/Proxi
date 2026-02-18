import { Request, Response } from 'express';
import { generateProxyReportPdf } from '../services/reportsPdfService';
import { generateTimetablePdf, generateBulkTimetablePdf } from '../services/pdfService';

export const generateProxyReport = async (req: Request, res: Response) => {
    try {
        const { proxies, startDate, endDate } = req.body;

        if (!proxies) {
            return res.status(400).json({ error: 'Missing proxies data' });
        }

        const pdfBuffer = await generateProxyReportPdf(proxies, startDate, endDate);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="proxy_report.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating proxy report PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

export const generateTimetable = async (req: Request, res: Response) => {
    try {
        const { timetable, periods, type, name } = req.body;

        if (!timetable || !periods || !type || !name) {
            return res.status(400).json({ error: 'Missing required fields: timetable, periods, type, or name' });
        }

        const pdfBuffer = await generateTimetablePdf(timetable, periods, type, name);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="timetable_${name}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating timetable PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

export const generateBulkTimetable = async (req: Request, res: Response) => {
    try {
        const { items, periods } = req.body;

        if (!items || !periods || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Missing required fields: items (array) and periods' });
        }

        const pdfBuffer = await generateBulkTimetablePdf(items, periods);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="timetables_bulk.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating bulk timetable PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

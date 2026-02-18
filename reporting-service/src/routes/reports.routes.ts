import { Router } from 'express';
import { generateProxyReport, generateTimetable, generateBulkTimetable } from '../controllers/reports.controller';

const router = Router();

router.post('/proxy-report', generateProxyReport as any);
router.post('/timetable', generateTimetable as any);
router.post('/bulk-timetable', generateBulkTimetable as any);

export default router;

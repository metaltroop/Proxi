"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const router = (0, express_1.Router)();
router.post('/proxy-report', reports_controller_1.generateProxyReport);
router.post('/timetable', reports_controller_1.generateTimetable);
router.post('/bulk-timetable', reports_controller_1.generateBulkTimetable);
exports.default = router;

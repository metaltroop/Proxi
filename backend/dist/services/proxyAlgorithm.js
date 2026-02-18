"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableTeachers = getAvailableTeachers;
exports.autoAssignProxies = autoAssignProxies;
const database_1 = __importDefault(require("../config/database"));
async function getAvailableTeachers(date, periodId, subjectId, absentTeacherId) {
    // Get the day of week
    const dayOfWeek = getDayOfWeek(date);
    // Get all active teachers except the absent one
    const allTeachers = await database_1.default.teacher.findMany({
        where: {
            isActive: true,
            id: { not: absentTeacherId }
        },
        include: {
            timetables: {
                where: { day: dayOfWeek }
            },
            proxiesAsAssigned: {
                where: { date }
            },
            absences: {
                where: { date }
            }
        }
    });
    // Get the period details
    const period = await database_1.default.period.findUnique({
        where: { id: periodId }
    });
    if (!period) {
        return [];
    }
    // Get all periods for adjacency check
    const allPeriods = await database_1.default.period.findMany({
        where: { isActive: true, periodType: 'CLASS' },
        orderBy: { periodNo: 'asc' }
    });
    const periodIndex = allPeriods.findIndex(p => p.id === periodId);
    const previousPeriodId = periodIndex > 0 ? allPeriods[periodIndex - 1].id : null;
    const nextPeriodId = periodIndex < allPeriods.length - 1 ? allPeriods[periodIndex + 1].id : null;
    const availableTeachers = [];
    for (const teacher of allTeachers) {
        // Skip if teacher is absent
        if (teacher.absences.length > 0) {
            continue;
        }
        // Check if teacher is already teaching in this period
        const isTeachingInPeriod = teacher.timetables.some(t => t.periodId === periodId);
        if (isTeachingInPeriod) {
            continue;
        }
        // Check if teacher already has a proxy in this period
        const hasProxyInPeriod = teacher.proxiesAsAssigned.some(p => p.periodId === periodId);
        if (hasProxyInPeriod) {
            continue;
        }
        // Calculate load
        const currentPeriods = teacher.timetables.length;
        const proxyCount = teacher.proxiesAsAssigned.length;
        const totalLoad = currentPeriods + proxyCount;
        // Skip if overloaded (configurable threshold)
        if (totalLoad >= 6) {
            continue;
        }
        // Check subject match
        const teachingSubjects = teacher.teachingSubjects;
        const subjectMatch = teachingSubjects && Array.isArray(teachingSubjects) &&
            teachingSubjects.includes(subjectId);
        // Check adjacency
        let adjacentFree = false;
        if (previousPeriodId) {
            const teachingPrevious = teacher.timetables.some(t => t.periodId === previousPeriodId);
            if (!teachingPrevious)
                adjacentFree = true;
        }
        if (nextPeriodId && !adjacentFree) {
            const teachingNext = teacher.timetables.some(t => t.periodId === nextPeriodId);
            if (!teachingNext)
                adjacentFree = true;
        }
        // Calculate score (lower is better)
        let score = totalLoad; // Base score is the load
        if (subjectMatch)
            score -= 2; // Bonus for subject match
        if (adjacentFree)
            score -= 1; // Bonus for adjacent free period
        availableTeachers.push({
            id: teacher.id,
            name: teacher.name,
            currentPeriods,
            proxyCount,
            totalLoad,
            subjectMatch,
            adjacentFree,
            score
        });
    }
    // Sort by score (lower is better)
    availableTeachers.sort((a, b) => a.score - b.score);
    return availableTeachers;
}
function getDayOfWeek(date) {
    const day = date.getDay();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[day];
}
async function autoAssignProxies(date, absentTeacherId) {
    // Get absent teacher's timetable for the day
    const dayOfWeek = getDayOfWeek(date);
    const timetable = await database_1.default.timetable.findMany({
        where: {
            teacherId: absentTeacherId,
            day: dayOfWeek
        },
        include: {
            period: true,
            class: true,
            subject: true
        },
        orderBy: {
            period: { periodNo: 'asc' }
        }
    });
    const assignments = [];
    for (const entry of timetable) {
        // Skip non-class periods
        if (entry.period.periodType !== 'CLASS') {
            continue;
        }
        const availableTeachers = await getAvailableTeachers(date, entry.periodId, entry.subjectId, absentTeacherId);
        if (availableTeachers.length > 0) {
            // Select the best available teacher (lowest score)
            const bestTeacher = availableTeachers[0];
            assignments.push({
                periodId: entry.periodId,
                classId: entry.classId,
                subjectId: entry.subjectId,
                assignedTeacherId: bestTeacher.id,
                period: entry.period,
                class: entry.class,
                subject: entry.subject,
                assignedTeacher: { id: bestTeacher.id, name: bestTeacher.name }
            });
        }
    }
    return assignments;
}
//# sourceMappingURL=proxyAlgorithm.js.map
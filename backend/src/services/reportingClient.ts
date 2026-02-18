import { Timetable, Class, Teacher, Subject, Period } from '@prisma/client';

const REPORTING_SERVICE_URL = process.env.REPORTING_SERVICE_URL || 'http://localhost:3001';

type TimetableWithRelations = Timetable & {
    class: Class;
    teacher: Teacher;
    subject: Subject;
    period: Period;
};

interface ProxyReport {
    id: string;
    date: Date;
    absentTeacher: { name: string; employeeId: string | null };
    assignedTeacher: { name: string; employeeId: string | null };
    class: { className: string; standard: number; division: string };
    subject: { subjectName: string; shortCode: string };
    period: { periodNo: number; startTime: string; endTime: string };
    status: string;
}

export const getTimetablePdf = async (
    timetable: TimetableWithRelations[],
    periods: Period[],
    type: 'class' | 'teacher',
    name: string
): Promise<Buffer> => {
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
    } catch (error) {
        console.error('Error fetching timetable PDF from reporting service:', error);
        throw error;
    }
};

export const getProxyReportPdf = async (
    proxies: ProxyReport[],
    startDate: string,
    endDate: string
): Promise<Buffer> => {
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
    } catch (error) {
        console.error('Error fetching proxy report PDF from reporting service:', error);
        throw error;
    }
};

export const getBulkTimetablePdf = async (
    payload: { items: any[], periods: any[] }
): Promise<Buffer> => {
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
    } catch (error) {
        console.error('Error fetching bulk timetable PDF from reporting service:', error);
        throw error;
    }
};

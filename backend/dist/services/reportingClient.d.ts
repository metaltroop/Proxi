import { Timetable, Class, Teacher, Subject, Period } from '@prisma/client';
type TimetableWithRelations = Timetable & {
    class: Class;
    teacher: Teacher;
    subject: Subject;
    period: Period;
};
interface ProxyReport {
    id: string;
    date: Date;
    absentTeacher: {
        name: string;
        employeeId: string | null;
    };
    assignedTeacher: {
        name: string;
        employeeId: string | null;
    };
    class: {
        className: string;
        standard: number;
        division: string;
    };
    subject: {
        subjectName: string;
        shortCode: string;
    };
    period: {
        periodNo: number;
        startTime: string;
        endTime: string;
    };
    status: string;
}
export declare const getTimetablePdf: (timetable: TimetableWithRelations[], periods: Period[], type: "class" | "teacher", name: string) => Promise<Buffer>;
export declare const getProxyReportPdf: (proxies: ProxyReport[], startDate: string, endDate: string) => Promise<Buffer>;
export declare const getBulkTimetablePdf: (payload: {
    items: any[];
    periods: any[];
}) => Promise<Buffer>;
export {};
//# sourceMappingURL=reportingClient.d.ts.map
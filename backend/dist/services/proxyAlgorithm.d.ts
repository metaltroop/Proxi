interface AvailableTeacher {
    id: string;
    name: string;
    currentPeriods: number;
    proxyCount: number;
    totalLoad: number;
    subjectMatch: boolean;
    adjacentFree: boolean;
    score: number;
}
export declare function getAvailableTeachers(date: Date, periodId: string, subjectId: string, absentTeacherId: string): Promise<AvailableTeacher[]>;
export declare function autoAssignProxies(date: Date, absentTeacherId: string): Promise<any[]>;
export {};
//# sourceMappingURL=proxyAlgorithm.d.ts.map
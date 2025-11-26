import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Printer, FileText, Search, Download } from 'lucide-react';
import Autocomplete from '../components/Autocomplete';

interface ProxyReport {
    id: string;
    date: string;
    absentTeacher: { name: string; employeeId: string | null };
    assignedTeacher: { name: string; employeeId: string | null };
    class: { className: string };
    subject: { subjectName: string; shortCode: string };
    period: { periodNo: number; startTime: string; endTime: string };
    status: string;
}

interface Teacher {
    id: string;
    name: string;
    employeeId: string | null;
}

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'proxy' | 'timetable'>('proxy');

    // Proxy Report State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [proxyReports, setProxyReports] = useState<ProxyReport[]>([]);
    const [loadingProxies, setLoadingProxies] = useState(false);

    // Timetable Report State
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [timetableData, setTimetableData] = useState<any>(null);
    const [loadingTimetable, setLoadingTimetable] = useState(false);

    useEffect(() => {
        if (activeTab === 'proxy') {
            fetchProxyReports();
        }
    }, [activeTab]);

    const fetchProxyReports = async () => {
        setLoadingProxies(true);
        try {
            const response = await api.get('/reports/proxies', {
                params: { startDate, endDate }
            });
            setProxyReports(response.data.proxies);
        } catch (error) {
            console.error('Failed to fetch proxy reports:', error);
        } finally {
            setLoadingProxies(false);
        }
    };

    const handleSearchTeachers = async (query: string) => {
        if (!query || query.length < 2) {
            setTeachers([]);
            return;
        }
        try {
            const response = await api.get('/teachers');
            const filtered = response.data.teachers.filter((t: Teacher) =>
                t.name.toLowerCase().includes(query.toLowerCase())
            );
            setTeachers(filtered);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

    const fetchTeacherTimetable = async () => {
        if (!selectedTeacherId) return;
        setLoadingTimetable(true);
        try {
            // We'll use the existing timetable endpoint but fetch all days
            // Since the current endpoint is day-specific, we might need to iterate or use a different endpoint
            // For now, let's assume we can fetch the full weekly schedule
            // Or we can fetch day by day. Let's try to fetch for Monday (day 0) to Saturday (day 5)

            const days = [0, 1, 2, 3, 4, 5];
            const promises = days.map(day =>
                api.get('/timetables', {
                    params: { teacherId: selectedTeacherId } // The existing endpoint returns all entries for a teacher
                })
            );

            // Actually the existing /timetables endpoint returns all entries for a teacher
            const response = await api.get('/timetables', {
                params: { teacherId: selectedTeacherId }
            });

            setTimetableData(response.data.timetable);
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
        } finally {
            setLoadingTimetable(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const autocompleteOptions = teachers.map(t => ({
        id: t.id,
        label: t.name,
        sublabel: t.employeeId || ''
    }));

    return (
        <div className="p-8 print:p-0">
            <div className="mb-6 print:hidden">
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-600 mt-1">View and print system reports</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 print:hidden">
                <button
                    onClick={() => setActiveTab('proxy')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'proxy'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Proxy History
                </button>
                <button
                    onClick={() => setActiveTab('timetable')}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'timetable'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Print Timetables
                </button>
            </div>

            {/* Proxy History Tab */}
            {activeTab === 'proxy' && (
                <div className="card print:shadow-none print:border-none">
                    <div className="flex flex-wrap items-end gap-4 mb-6 print:hidden">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={fetchProxyReports}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            Filter
                        </button>
                        <button
                            onClick={handlePrint}
                            className="btn btn-secondary flex items-center gap-2 ml-auto"
                        >
                            <Printer className="w-4 h-4" />
                            Print Report
                        </button>
                    </div>

                    <div className="print:block">
                        <h2 className="text-xl font-bold mb-4 hidden print:block">
                            Proxy Assignment Report ({new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()})
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 print:bg-gray-100">
                                        <th className="border p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                        <th className="border p-3 text-left text-sm font-semibold text-gray-700">Period</th>
                                        <th className="border p-3 text-left text-sm font-semibold text-gray-700">Absent Teacher</th>
                                        <th className="border p-3 text-left text-sm font-semibold text-gray-700">Proxy Teacher</th>
                                        <th className="border p-3 text-left text-sm font-semibold text-gray-700">Class</th>
                                        <th className="border p-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                                        <th className="border p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingProxies ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td>
                                        </tr>
                                    ) : proxyReports.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">No records found</td>
                                        </tr>
                                    ) : (
                                        proxyReports.map((report) => (
                                            <tr key={report.id} className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="border p-3 text-sm text-gray-800">
                                                    {new Date(report.date).toLocaleDateString()}
                                                </td>
                                                <td className="border p-3 text-sm text-gray-800">
                                                    P{report.period.periodNo} ({report.period.startTime}-{report.period.endTime})
                                                </td>
                                                <td className="border p-3 text-sm text-gray-800 font-medium text-red-600">
                                                    {report.absentTeacher.name}
                                                </td>
                                                <td className="border p-3 text-sm text-gray-800 font-medium text-green-600">
                                                    {report.assignedTeacher.name}
                                                </td>
                                                <td className="border p-3 text-sm text-gray-800">
                                                    {report.class.className}
                                                </td>
                                                <td className="border p-3 text-sm text-gray-800">
                                                    {report.subject.subjectName}
                                                </td>
                                                <td className="border p-3 text-sm text-gray-800">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                                                            report.status === 'BUSY' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
                <div className="card print:shadow-none print:border-none">
                    <div className="flex flex-wrap items-end gap-4 mb-6 print:hidden">
                        <div className="w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Teacher</label>
                            <Autocomplete
                                options={autocompleteOptions}
                                value={selectedTeacherId}
                                onChange={(val) => {
                                    setSelectedTeacherId(val);
                                    handleSearchTeachers(val); // Trigger search
                                }}
                                placeholder="Search teacher..."
                            />
                        </div>
                        <button
                            onClick={fetchTeacherTimetable}
                            disabled={!selectedTeacherId}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" />
                            View Timetable
                        </button>
                        {timetableData && (
                            <button
                                onClick={handlePrint}
                                className="btn btn-secondary flex items-center gap-2 ml-auto"
                            >
                                <Printer className="w-4 h-4" />
                                Print Timetable
                            </button>
                        )}
                    </div>

                    {timetableData && (
                        <div className="print:block">
                            <div className="text-center mb-6 hidden print:block">
                                <h2 className="text-2xl font-bold text-gray-900">Weekly Timetable</h2>
                                <p className="text-gray-600">
                                    Teacher: {teachers.find(t => t.id === selectedTeacherId)?.name}
                                </p>
                            </div>

                            {/* We can reuse the Timetable Grid logic here but read-only */}
                            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                Timetable preview will be implemented here reusing the grid component.
                                <br />
                                (For now, please use the main Timetables page to view full schedules)
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Download, TrendingUp, Users, UserX, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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

interface Stats {
    totalProxies: number;
    mostAbsent: { teacherId: string; name: string; count: number }[];
    mostActiveProxies: { teacherId: string; name: string; count: number }[];
}

const Reports: React.FC = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'proxy'>('overview');

    // Proxy Report State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [proxyReports, setProxyReports] = useState<ProxyReport[]>([]);
    const [loadingProxies, setLoadingProxies] = useState(false);

    // Stats State
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchStats();
        } else if (activeTab === 'proxy') {
            fetchProxyReports();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const response = await api.get('/reports/stats', {
                params: { startDate, endDate }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

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

    const handleDownloadPdf = async () => {
        try {
            const response = await api.get('/reports/proxies/download-pdf', {
                params: { startDate, endDate },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `proxy_report_${startDate}_to_${endDate}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download PDF error:', error);
            alert('Failed to download PDF');
        }
    };

    return (
        <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Sticky Header */}
            <div className={`flex-shrink-0 p-4 md:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="mb-6">
                    <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reports & Analytics</h1>
                    <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>View proxy statistics and generate reports</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview'
                                ? (isDarkMode ? 'bg-primary-600 text-white shadow-md' : 'bg-primary-600 text-white shadow-md')
                                : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50')
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('proxy')}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'proxy'
                                ? (isDarkMode ? 'bg-primary-600 text-white shadow-md' : 'bg-primary-600 text-white shadow-md')
                                : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50')
                            }`}
                    >
                        Proxy History
                    </button>
                </div>

                {/* Date Range Filter */}
                <div className={`rounded-xl p-4 md:p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        <div className="flex-1">
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>
                        <div className="flex-1">
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                            />
                        </div>
                        <button
                            onClick={activeTab === 'overview' ? fetchStats : fetchProxyReports}
                            className="btn btn-primary flex items-center justify-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Apply Filter
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {loadingStats ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                        <div className="animate-pulse space-y-3">
                                            <div className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                            <div className={`h-8 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : stats ? (
                            <>
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Proxies</p>
                                                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.totalProxies}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                                                <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                                            </div>
                                            <div>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Most Absent</p>
                                                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {stats.mostAbsent[0]?.name || 'N/A'}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    {stats.mostAbsent[0]?.count || 0} times
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Top Proxy</p>
                                                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {stats.mostActiveProxies[0]?.name || 'N/A'}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    {stats.mostActiveProxies[0]?.count || 0} times
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Lists */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Most Absent Teachers */}
                                    <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Most Absent Teachers</h3>
                                        <div className="space-y-3">
                                            {stats.mostAbsent.length > 0 ? stats.mostAbsent.map((teacher, index) => (
                                                <div key={teacher.teacherId} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                                            }`}>
                                                            {index + 1}
                                                        </span>
                                                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{teacher.name}</span>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                                                        {teacher.count} times
                                                    </span>
                                                </div>
                                            )) : (
                                                <p className={`text-center py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No data available</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Most Active Proxies */}
                                    <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Most Active Proxies</h3>
                                        <div className="space-y-3">
                                            {stats.mostActiveProxies.length > 0 ? stats.mostActiveProxies.map((teacher, index) => (
                                                <div key={teacher.teacherId} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                                                            }`}>
                                                            {index + 1}
                                                        </span>
                                                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{teacher.name}</span>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                                                        {teacher.count} times
                                                    </span>
                                                </div>
                                            )) : (
                                                <p className={`text-center py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>No data available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}

                {/* Proxy History Tab */}
                {activeTab === 'proxy' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Proxy Assignment History
                            </h2>
                            {proxyReports.length > 0 && (
                                <button
                                    onClick={handleDownloadPdf}
                                    className="btn btn-secondary flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="hidden md:inline">Download PDF</span>
                                </button>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className={`hidden md:block rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                                        <tr>
                                            <th className={`p-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                                            <th className={`p-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Period</th>
                                            <th className={`p-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Absent Teacher</th>
                                            <th className={`p-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Proxy Teacher</th>
                                            <th className={`p-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Class</th>
                                            <th className={`p-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subject</th>
                                            <th className={`p-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingProxies ? (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center">
                                                    <div className="animate-pulse space-y-3">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className={`h-12 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : proxyReports.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className={`p-8 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    No proxy assignments found for the selected date range
                                                </td>
                                            </tr>
                                        ) : (
                                            proxyReports.map((report) => (
                                                <tr key={report.id} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                                    <td className={`p-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                                        {new Date(report.date).toLocaleDateString()}
                                                    </td>
                                                    <td className={`p-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                                        P{report.period.periodNo} ({report.period.startTime}-{report.period.endTime})
                                                    </td>
                                                    <td className="p-3 text-sm font-medium text-red-600 dark:text-red-400">
                                                        {report.absentTeacher.name}
                                                    </td>
                                                    <td className="p-3 text-sm font-medium text-green-600 dark:text-green-400">
                                                        {report.assignedTeacher.name}
                                                    </td>
                                                    <td className={`p-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                                        {report.class.className}
                                                    </td>
                                                    <td className={`p-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                                        {report.subject.subjectName}
                                                    </td>
                                                    <td className="p-3 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'ABSENT' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                                                report.status === 'BUSY' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                                                    'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
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

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {loadingProxies ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                        <div className="animate-pulse space-y-3">
                                            <div className={`h-4 rounded w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                            <div className={`h-4 rounded w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                            <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                        </div>
                                    </div>
                                ))
                            ) : proxyReports.length === 0 ? (
                                <div className={`rounded-xl p-8 border text-center ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-500'}`}>
                                    No proxy assignments found for the selected date range
                                </div>
                            ) : (
                                proxyReports.map((report) => (
                                    <div key={report.id} className={`rounded-xl p-4 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {new Date(report.date).toLocaleDateString()}
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                    Period {report.period.periodNo} • {report.period.startTime}-{report.period.endTime}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'ABSENT' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                                    report.status === 'BUSY' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                                        'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Absent Teacher</p>
                                                <p className="text-sm font-medium text-red-600 dark:text-red-400">{report.absentTeacher.name}</p>
                                            </div>
                                            <div>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Proxy Teacher</p>
                                                <p className="text-sm font-medium text-green-600 dark:text-green-400">{report.assignedTeacher.name}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div>
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Class</p>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{report.class.className}</p>
                                                </div>
                                                <div>
                                                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Subject</p>
                                                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{report.subject.subjectName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;

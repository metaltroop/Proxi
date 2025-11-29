import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, UserX, UserPlus, Activity, Calendar, Clock, ArrowRight, Plus, BarChart2, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PRESET_ANIMATIONS } from '../utils/animations';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import AnimatedToggle from '../components/AnimatedToggle';

interface DashboardStats {
    totalTeachers: number;
    teachersAbsentToday: number;
    proxiesAssignedToday: number;
    proxyTrends: { date: string; count: number }[];
    teacherAvailability: { name: string; value: number; color: string }[];
    recentProxies: any[];
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const { isDarkMode } = useTheme();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`p-4 md:p-8 space-y-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`h-20 rounded-xl animate-pulse w-1/3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-32 rounded-xl animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`h-80 rounded-xl animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                    <div className={`h-80 rounded-xl animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                </div>
            </div>
        );
    }

    const renderOverview = () => (
        <>
            {/* Stats Cards */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${activeTab === 'overview' ? 'block' : 'hidden md:grid'}`}>
                <div className={`card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900 dark:to-blue-950 dark:border-blue-800 hover:shadow-lg transition-all duration-300 ${PRESET_ANIMATIONS.scaleIn} delay-100`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">Total Teachers</p>
                            <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">{stats?.totalTeachers || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center shadow-inner">
                            <Users className="w-6 h-6 text-blue-700 dark:text-blue-200" />
                        </div>
                    </div>
                </div>

                <div className={`card bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900 dark:to-red-950 dark:border-red-800 hover:shadow-lg transition-all duration-300 ${PRESET_ANIMATIONS.scaleIn} delay-200`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-300 mb-1">Absent Today</p>
                            <p className="text-4xl font-bold text-red-900 dark:text-red-100">{stats?.teachersAbsentToday || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center shadow-inner">
                            <UserX className="w-6 h-6 text-red-700 dark:text-red-200" />
                        </div>
                    </div>
                </div>

                <div className={`card bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900 dark:to-green-950 dark:border-green-800 hover:shadow-lg transition-all duration-300 ${PRESET_ANIMATIONS.scaleIn} delay-300`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-300 mb-1">Proxies Assigned</p>
                            <p className="text-4xl font-bold text-green-900 dark:text-green-100">{stats?.proxiesAssignedToday || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center shadow-inner">
                            <UserPlus className="w-6 h-6 text-green-700 dark:text-green-200" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${activeTab === 'overview' ? 'block' : 'hidden md:grid'}`}>
                {/* Recent Activity */}
                <div className={`lg:col-span-2 card dark:bg-gray-800 dark:border-gray-700 ${PRESET_ANIMATIONS.slideInUp} delay-500`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Assignments</h2>
                        <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {stats?.recentProxies && stats.recentProxies.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentProxies.map((proxy: any, index: number) => (
                                <div
                                    key={proxy.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                                            {proxy.class.className.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {proxy.subject.shortCode} • Period {proxy.period.periodNo}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <span className="text-red-500 dark:text-red-400">{proxy.absentTeacher.name}</span>
                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                <span className="text-green-600 dark:text-green-400">{proxy.assignedTeacher.name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(proxy.createdAt), 'h:mm a')}
                                        </div>
                                        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                            {format(new Date(proxy.createdAt), 'MMM d')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">No recent activity found</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className={`card h-fit dark:bg-gray-800 dark:border-gray-700 ${PRESET_ANIMATIONS.slideInUp} delay-600`}>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link to="/proxies" className="w-full btn btn-primary flex items-center justify-center gap-2 py-3">
                            <UserPlus className="w-5 h-5" />
                            Assign Proxy
                        </Link>
                        <Link to="/teachers" className="w-full btn btn-secondary flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">
                            <Plus className="w-5 h-5" />
                            Add Teacher
                        </Link>
                        <Link to="/timetables" className="w-full btn btn-secondary flex items-center justify-center gap-2 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">
                            <Calendar className="w-5 h-5" />
                            View Timetables
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );

    const renderCharts = () => (
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${activeTab === 'analytics' ? 'block' : 'hidden md:grid'}`}>
            {/* Proxy Trends */}
            <div className={`lg:col-span-2 card dark:bg-gray-800 dark:border-gray-700 ${PRESET_ANIMATIONS.slideInUp} delay-300`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary-600" />
                        Proxy Trends (Last 7 Days)
                    </h2>
                </div>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.proxyTrends || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: isDarkMode ? '#374151' : '#F3F4F6' }}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                    color: isDarkMode ? '#F3F4F6' : '#111827'
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#4F46E5"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Teacher Availability */}
            <div className={`card dark:bg-gray-800 dark:border-gray-700 ${PRESET_ANIMATIONS.slideInUp} delay-400`}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Teacher Availability</h2>
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats?.teacherAvailability || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats?.teacherAvailability.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke={isDarkMode ? '#1F2937' : '#FFFFFF'} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                                    color: isDarkMode ? '#F3F4F6' : '#111827'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalTeachers || 0}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</span>
                    </div>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    {stats?.teacherAvailability.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className={`p-4 md:p-8 space-y-8 pb-32 md:pb-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${PRESET_ANIMATIONS.slideInRight}`}>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(), 'EEEE, MMMM d, yyyy')}
                    </p>
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden w-full">
                    <AnimatedToggle
                        options={[
                            { value: 'overview', label: 'Overview' },
                            { value: 'analytics', label: 'Analytics' }
                        ]}
                        value={activeTab}
                        onChange={setActiveTab}
                        isDarkMode={isDarkMode}
                        className="w-full"
                    />
                </div>

                <div className="hidden md:flex gap-3">
                    <Link to="/proxies" className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                        <UserPlus className="w-4 h-4" />
                        Assign Proxy
                    </Link>
                </div>
            </div>

            {renderOverview()}
            {renderCharts()}
        </div>
    );
};

export default Dashboard;

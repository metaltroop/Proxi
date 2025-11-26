import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, UserX, UserPlus, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
    totalTeachers: number;
    teachersAbsentToday: number;
    proxiesAssignedToday: number;
    recentProxies: any[];
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/reports/dashboard-stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">Total Teachers</p>
                            <p className="text-3xl font-bold text-blue-900">{stats?.totalTeachers || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-700" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600 mb-1">Teachers Absent Today</p>
                            <p className="text-3xl font-bold text-red-900">{stats?.teachersAbsentToday || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                            <UserX className="w-6 h-6 text-red-700" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 mb-1">Proxies Assigned Today</p>
                            <p className="text-3xl font-bold text-green-900">{stats?.proxiesAssignedToday || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-green-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-6 h-6 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-900">Recent Proxy Assignments</h2>
                </div>

                {stats?.recentProxies && stats.recentProxies.length > 0 ? (
                    <div className="space-y-3">
                        {stats.recentProxies.map((proxy: any) => (
                            <div
                                key={proxy.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {proxy.class.className} - {proxy.subject.shortCode}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Period {proxy.period.periodNo} • {proxy.absentTeacher.name} → {proxy.assignedTeacher.name}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {format(new Date(proxy.createdAt), 'MMM d, h:mm a')}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No recent proxy assignments</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

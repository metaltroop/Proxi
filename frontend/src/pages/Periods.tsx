import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Save, RefreshCw, Clock, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

interface Period {
    id: string;
    periodNo: number;
    startTime: string;
    endTime: string;
    periodType: 'CLASS' | 'RECESS' | 'LUNCH' | 'ASSEMBLY' | 'ACTIVITY';
}

const Periods: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'card' | 'table'>(window.innerWidth < 768 ? 'card' : 'table');
    const [showModal, setShowModal] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
    const [formData, setFormData] = useState({
        periodNo: '',
        startTime: '',
        endTime: '',
        periodType: 'CLASS' as 'CLASS' | 'RECESS' | 'LUNCH' | 'ASSEMBLY' | 'ACTIVITY'
    });

    useEffect(() => {
        fetchPeriods();
    }, []);

    const fetchPeriods = async () => {
        try {
            const response = await api.get('/periods');
            setPeriods(response.data.periods);
        } catch (error) {
            console.error('Failed to fetch periods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchPeriods();
    };

    const handleCreate = () => {
        setEditingPeriod(null);
        setFormData({ periodNo: '', startTime: '', endTime: '', periodType: 'CLASS' });
        setShowModal(true);
    };

    const handleEdit = (period: Period) => {
        setEditingPeriod(period);
        setFormData({
            periodNo: period.periodNo.toString(),
            startTime: period.startTime,
            endTime: period.endTime,
            periodType: period.periodType
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if ((!formData.periodNo && formData.periodType === 'CLASS') || !formData.startTime || !formData.endTime) {
            toast.error('All fields are required');
            return;
        }

        try {
            const data = {
                periodNo: formData.periodType === 'CLASS' ? parseInt(formData.periodNo) : 0,
                startTime: formData.startTime,
                endTime: formData.endTime,
                periodType: formData.periodType
            };

            if (editingPeriod) {
                await api.put(`/periods/${editingPeriod.id}`, data);
            } else {
                await api.post('/periods', data);
            }
            setShowModal(false);
            fetchPeriods();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save period');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this period?')) return;

        try {
            await api.delete(`/periods/${id}`);
            fetchPeriods();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete period');
        }
    };

    if (loading) {
        return (
            <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`flex-shrink-0 p-4 md:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="animate-pulse">
                        <div className="flex justify-between items-center mb-6">
                            <div className="space-y-2">
                                <div className={`h-8 w-48 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                <div className={`h-4 w-32 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            </div>
                            <div className={`h-10 w-32 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                        </div>
                        <div className={`h-12 w-full rounded-lg mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-16 w-full rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Sticky Header */}
            <div className={`flex-shrink-0 p-4 md:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Period Structure</h1>
                        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{periods.length} periods configured</p>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-auto">
                        {/* View Toggle */}
                        <div className={`flex items-center rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <button
                                onClick={() => setViewMode('card')}
                                className={`p-2 rounded ${viewMode === 'card'
                                    ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-primary-600 shadow-sm')
                                    : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')}`}
                                title="Card View"
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded ${viewMode === 'table'
                                    ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-primary-600 shadow-sm')
                                    : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')}`}
                                title="Table View"
                            >
                                <TableIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <button onClick={handleRefresh} className={`btn btn-secondary flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : ''}`} disabled={loading}>
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden md:inline">Refresh</span>
                        </button>
                        <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span className="hidden md:inline">Add Period</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 md:pb-8">
                {periods.length > 0 ? (
                    <>
                        {/* Card View */}
                        {viewMode === 'card' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {periods.map(period => {
                                    const start = new Date(`2000-01-01T${period.startTime}`);
                                    const end = new Date(`2000-01-01T${period.endTime}`);
                                    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

                                    return (
                                        <div key={period.id} className={`rounded-xl p-4 border transition-all duration-200 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:border-primary-200'}`}>
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {period.periodType === 'CLASS' ? `Period ${period.periodNo}` : period.periodType}
                                                    </h3>
                                                    <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {period.startTime} - {period.endTime}
                                                    </div>
                                                </div>
                                                {period.periodType === 'CLASS' ? (
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-700'}`}>Class</span>
                                                ) : period.periodType === 'RECESS' ? (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Recess</span>
                                                ) : period.periodType === 'LUNCH' ? (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Lunch</span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">{period.periodType}</span>
                                                )}
                                            </div>

                                            <div className={`flex items-center justify-between pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {duration} mins
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(period)}
                                                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(period.id)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Table View */}
                        {viewMode === 'table' && (
                            <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Period No.</th>
                                                <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start Time</th>
                                                <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>End Time</th>
                                                <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Duration</th>
                                                <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</th>
                                                <th className={`text-right p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {periods.map(period => {
                                                const start = new Date(`2000-01-01T${period.startTime}`);
                                                const end = new Date(`2000-01-01T${period.endTime}`);
                                                const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

                                                return (
                                                    <tr key={period.id} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                                                        <td className={`p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            {period.periodType === 'CLASS' ? (
                                                                `Period ${period.periodNo}`
                                                            ) : (
                                                                <span className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-orange-500" />
                                                                    {period.periodType}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{period.startTime}</td>
                                                        <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{period.endTime}</td>
                                                        <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{duration} mins</td>
                                                        <td className="p-4">
                                                            {period.periodType === 'CLASS' ? (
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-700'}`}>Class</span>
                                                            ) : period.periodType === 'RECESS' ? (
                                                                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Recess</span>
                                                            ) : period.periodType === 'LUNCH' ? (
                                                                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Lunch</span>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">{period.periodType}</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleEdit(period)}
                                                                    className={`btn p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'btn-secondary'}`}
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(period.id)}
                                                                    className="btn bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={`rounded-xl p-12 text-center border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No periods configured</p>
                        <button onClick={handleCreate} className="btn btn-primary inline-flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span>Add Period</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
                    <div className={`rounded-xl shadow-2xl max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className={`border-b px-6 py-4 flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {editingPeriod ? 'Edit Period' : 'Add New Period'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className={`hover:text-gray-600 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400'}`}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Period Type */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Period Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.periodType}
                                    onChange={(e) => setFormData({ ...formData, periodType: e.target.value as any })}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'}`}
                                >
                                    <option value="CLASS">Class Period</option>
                                    <option value="RECESS">Recess</option>
                                    <option value="LUNCH">Lunch Break</option>
                                    <option value="ASSEMBLY">Assembly</option>
                                    <option value="ACTIVITY">Activity</option>
                                </select>
                            </div>

                            {/* Period Number */}
                            {formData.periodType === 'CLASS' && (
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Period Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.periodNo}
                                        onChange={(e) => setFormData({ ...formData, periodNo: e.target.value })}
                                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                        placeholder="e.g., 1"
                                        min="1"
                                    />
                                </div>
                            )}

                            {/* Start Time */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Start Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                            </div>

                            {/* End Time */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    End Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                            </div>
                        </div>

                        <div className={`px-6 py-4 flex items-center justify-end gap-3 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <button onClick={() => setShowModal(false)} className={`btn ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}>
                                Cancel
                            </button>
                            <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                <span>{editingPeriod ? 'Update' : 'Create'} Period</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Periods;

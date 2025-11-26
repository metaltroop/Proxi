import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Save, RefreshCw, Clock } from 'lucide-react';

interface Period {
    id: string;
    periodNo: number;
    startTime: string;
    endTime: string;
    periodType: 'CLASS' | 'RECESS' | 'LUNCH' | 'ASSEMBLY' | 'ACTIVITY';
}

const Periods: React.FC = () => {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [loading, setLoading] = useState(true);
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
            alert('All fields are required');
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
            alert(error.response?.data?.error || 'Failed to save period');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this period?')) return;

        try {
            await api.delete(`/periods/${id}`);
            fetchPeriods();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete period');
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Period Structure</h1>
                    <p className="text-gray-600 mt-1">{periods.length} periods configured</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleRefresh} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span>Add Period</span>
                    </button>
                </div>
            </div>

            {/* Periods Table */}
            {periods.length > 0 ? (
                <div className="card overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left p-4 font-semibold text-gray-700">Period No.</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Start Time</th>
                                <th className="text-left p-4 font-semibold text-gray-700">End Time</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Duration</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Type</th>
                                <th className="text-right p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map(period => {
                                const start = new Date(`2000-01-01T${period.startTime}`);
                                const end = new Date(`2000-01-01T${period.endTime}`);
                                const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

                                return (
                                    <tr key={period.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">
                                            {period.periodType === 'CLASS' ? (
                                                `Period ${period.periodNo}`
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-orange-500" />
                                                    {period.periodType}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">{period.startTime}</td>
                                        <td className="p-4 text-sm text-gray-600">{period.endTime}</td>
                                        <td className="p-4 text-sm text-gray-600">{duration} mins</td>
                                        <td className="p-4">
                                            {period.periodType === 'CLASS' ? (
                                                <span className="badge badge-primary">Class</span>
                                            ) : period.periodType === 'RECESS' ? (
                                                <span className="badge badge-warning">Recess</span>
                                            ) : period.periodType === 'LUNCH' ? (
                                                <span className="badge badge-success">Lunch</span>
                                            ) : (
                                                <span className="badge badge-info">{period.periodType}</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(period)}
                                                    className="btn btn-secondary p-2"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(period.id)}
                                                    className="btn btn-danger p-2"
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
            ) : (
                <div className="card text-center py-12">
                    <p className="text-gray-500 mb-4">No periods configured</p>
                    <button onClick={handleCreate} className="btn btn-primary inline-flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span>Add Period</span>
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingPeriod ? 'Edit Period' : 'Add New Period'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Period Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Period Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.periodType}
                                    onChange={(e) => setFormData({ ...formData, periodType: e.target.value as any })}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all cursor-pointer hover:border-gray-400"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Period Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.periodNo}
                                        onChange={(e) => setFormData({ ...formData, periodNo: e.target.value })}
                                        className="input"
                                        placeholder="e.g., 1"
                                        min="1"
                                    />
                                </div>
                            )}

                            {/* Start Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="input"
                                />
                            </div>

                            {/* End Time */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="input"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary">
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

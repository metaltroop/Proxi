import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Save, RefreshCw, Search, LayoutGrid, Table as TableIcon } from 'lucide-react';

interface Subject {
    id: string;
    subjectName: string;
    shortCode: string;
    description?: string;
}

const Subjects: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({
        subjectName: '',
        shortCode: '',
        description: ''
    });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subjects');
            setSubjects(response.data.subjects);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchSubjects();
    };

    const handleCreate = () => {
        setEditingSubject(null);
        setFormData({ subjectName: '', shortCode: '', description: '' });
        setShowModal(true);
    };

    const handleEdit = (subject: Subject) => {
        setEditingSubject(subject);
        setFormData({
            subjectName: subject.subjectName,
            shortCode: subject.shortCode,
            description: subject.description || ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.subjectName || !formData.shortCode) {
            alert('Subject name and short code are required');
            return;
        }

        try {
            if (editingSubject) {
                await api.put(`/subjects/${editingSubject.id}`, formData);
            } else {
                await api.post('/subjects', formData);
            }
            setShowModal(false);
            fetchSubjects();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to save subject');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;

        try {
            await api.delete(`/subjects/${id}`);
            fetchSubjects();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete subject');
        }
    };

    const filteredSubjects = subjects.filter(subject =>
        subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
                    <p className="text-gray-600 mt-1">{filteredSubjects.length} of {subjects.length} subjects</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-2 rounded ${viewMode === 'card' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                            title="Card View"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                            title="Table View"
                        >
                            <TableIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <button onClick={handleRefresh} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                    <button onClick={handleCreate} className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span>Add Subject</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="card mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input pl-10"
                    />
                </div>
            </div>

            {/* Card View */}
            {viewMode === 'card' && filteredSubjects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubjects.map(subject => (
                        <div key={subject.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{subject.subjectName}</h3>
                                    <span className="badge badge-primary mt-2 inline-block">{subject.shortCode}</span>
                                    {subject.description && (
                                        <p className="text-sm text-gray-600 mt-2">{subject.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                                <button
                                    onClick={() => handleEdit(subject)}
                                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2 text-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(subject.id)}
                                    className="btn btn-danger p-2"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && filteredSubjects.length > 0 && (
                <div className="card overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left p-4 font-semibold text-gray-700">Subject Name</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Short Code</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Description</th>
                                <th className="text-right p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubjects.map(subject => (
                                <tr key={subject.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">{subject.subjectName}</td>
                                    <td className="p-4">
                                        <span className="badge badge-primary">{subject.shortCode}</span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {subject.description || <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(subject)}
                                                className="btn btn-secondary p-2"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                className="btn btn-danger p-2"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredSubjects.length === 0 && (
                <div className="card text-center py-12">
                    <p className="text-gray-500 mb-4">No subjects found</p>
                    <button onClick={handleCreate} className="btn btn-primary inline-flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span>Add Subject</span>
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Subject Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.subjectName}
                                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                                    className="input"
                                    placeholder="e.g., Mathematics"
                                />
                            </div>

                            {/* Short Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Short Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.shortCode}
                                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                                    className="input"
                                    placeholder="e.g., MATH"
                                    maxLength={10}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input"
                                    placeholder="Optional description..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                <span>{editingSubject ? 'Update' : 'Create'} Subject</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subjects;

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Save, RefreshCw, Search, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Subject {
    id: string;
    subjectName: string;
    shortCode: string;
    description?: string;
}

const Subjects: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'table'>(window.innerWidth < 768 ? 'card' : 'table');
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
            <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`flex-shrink-0 p-4 md:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="animate-pulse">
                        <div className="flex justify-between items-center mb-6">
                            <div className="space-y-2">
                                <div className={`h-8 w-48 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                <div className={`h-4 w-32 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            </div>
                            <div className="flex gap-2">
                                <div className={`h-10 w-24 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                <div className={`h-10 w-32 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            </div>
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
                        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subjects</h1>
                        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{filteredSubjects.length} of {subjects.length} subjects</p>
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
                            <span className="hidden md:inline">Add Subject</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all
                            ${isDarkMode
                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-primary-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                            }`}
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 md:pb-8">
                {/* Card View */}
                {viewMode === 'card' && filteredSubjects.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredSubjects.map(subject => (
                            <div key={subject.id} className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:border-primary-200'}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{subject.subjectName}</h3>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-700'}`}>
                                            {subject.shortCode}
                                        </span>
                                        {subject.description && (
                                            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subject.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className={`flex items-center gap-2 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                    <button
                                        onClick={() => handleEdit(subject)}
                                        className={`flex-1 btn flex items-center justify-center gap-2 text-sm ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'btn-secondary'}`}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(subject.id)}
                                        className="btn bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg"
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
                    <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subject Name</th>
                                        <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Short Code</th>
                                        <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</th>
                                        <th className={`text-right p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubjects.map(subject => (
                                        <tr key={subject.id} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                                            <td className={`p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{subject.subjectName}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-50 text-primary-700'}`}>
                                                    {subject.shortCode}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {subject.description || <span className="text-gray-500">-</span>}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(subject)}
                                                        className={`btn p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'btn-secondary'}`}
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(subject.id)}
                                                        className="btn bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg"
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
                    </div>
                )}

                {filteredSubjects.length === 0 && (
                    <div className={`rounded-xl p-12 text-center border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No subjects found</p>
                        <button onClick={handleCreate} className="btn btn-primary inline-flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span>Add Subject</span>
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
                                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className={`hover:text-gray-600 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400'}`}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Subject Name */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Subject Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.subjectName}
                                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                    placeholder="e.g., Mathematics"
                                />
                            </div>

                            {/* Short Code */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Short Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.shortCode}
                                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                    placeholder="e.g., MATH"
                                    maxLength={10}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                    placeholder="Optional description..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className={`px-6 py-4 flex items-center justify-end gap-3 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <button onClick={() => setShowModal(false)} className={`btn ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}>
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

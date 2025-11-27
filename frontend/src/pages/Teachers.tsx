import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    LayoutGrid,
    Table as TableIcon,
    RefreshCw,
    Calendar
} from 'lucide-react';

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    employeeId?: string;
    isClassTeacher: boolean;
    assignedClass?: {
        id: string;
        className: string;
        standard: number;
    };
    teachingSubjects?: string[];
    isActive: boolean;
}

interface Subject {
    id: string;
    subjectName: string;
    shortCode: string;
}

interface Class {
    id: string;
    className: string;
    standard: number;
}

const Teachers: React.FC = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'class' | 'subject'>('all');
    const [standardFilter, setStandardFilter] = useState<number | null>(null);
    const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        employeeId: '',
        isClassTeacher: false,
        assignedClassId: '',
        teachingSubjects: [] as string[]
    });

    useEffect(() => {
        fetchTeachers();
        fetchSubjects();
        fetchClasses();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/teachers');
            setTeachers(response.data.teachers);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/subjects');
            setSubjects(response.data.subjects);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes');
            setClasses(response.data.classes);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchTeachers();
        fetchSubjects();
        fetchClasses();
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!formData.name.trim()) errors.name = 'Name is required';
        if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) {
            errors.phone = 'Phone is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            errors.phone = 'Phone must be 10 digits';
        }
        if (formData.isClassTeacher && !formData.assignedClassId) {
            errors.assignedClassId = 'Please select a class';
        }
        if (formData.teachingSubjects.length === 0) {
            errors.teachingSubjects = 'Please select at least one teaching subject';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateTeacher = () => {
        setEditingTeacher(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            employeeId: '',
            isClassTeacher: false,
            assignedClassId: '',
            teachingSubjects: []
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            employeeId: teacher.employeeId || '',
            isClassTeacher: teacher.isClassTeacher,
            assignedClassId: teacher.assignedClass?.id || '',
            teachingSubjects: teacher.teachingSubjects || []
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleSaveTeacher = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            if (editingTeacher) {
                await api.put(`/teachers/${editingTeacher.id}`, formData);
            } else {
                await api.post('/teachers', formData);
            }
            setShowModal(false);
            fetchTeachers();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to save teacher');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTeacher = async (id: string) => {
        if (!confirm('Are you sure you want to delete this teacher?')) return;

        try {
            await api.delete(`/teachers/${id}`);
            fetchTeachers();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete teacher');
        }
    };



    const toggleSubject = (subjectId: string) => {
        setFormData(prev => ({
            ...prev,
            teachingSubjects: prev.teachingSubjects.includes(subjectId)
                ? prev.teachingSubjects.filter(id => id !== subjectId)
                : [...prev.teachingSubjects, subjectId]
        }));
    };

    // Filter teachers
    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch =
            teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (teacher.email && teacher.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            teacher.phone.includes(searchQuery);

        if (!matchesSearch) return false;
        if (filterTab === 'class' && !teacher.isClassTeacher) return false;
        if (filterTab === 'subject' && teacher.isClassTeacher) return false;
        if (standardFilter && teacher.assignedClass?.standard !== standardFilter) return false;
        if (subjectFilter && !teacher.teachingSubjects?.includes(subjectFilter)) return false;

        return true;
    });

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
                    <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
                    <p className="text-gray-600 mt-1">{filteredTeachers.length} of {teachers.length} teachers</p>
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
                    <button onClick={handleCreateTeacher} className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span>Add Teacher</span>
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-4 border-b border-gray-200 mb-4">
                    <button
                        onClick={() => { setFilterTab('all'); setStandardFilter(null); setSubjectFilter(null); }}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${filterTab === 'all'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        All Teachers
                    </button>
                    <button
                        onClick={() => { setFilterTab('class'); setSubjectFilter(null); }}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${filterTab === 'class'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Class Teachers
                    </button>
                    <button
                        onClick={() => { setFilterTab('subject'); setStandardFilter(null); }}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${filterTab === 'subject'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Subject Teachers
                    </button>
                </div>

                {/* Additional Filters */}
                <div className="flex items-center gap-4">
                    {filterTab === 'class' && (
                        <select
                            value={standardFilter || ''}
                            onChange={(e) => setStandardFilter(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-48 bg-white border-2 border-primary-300 rounded-lg px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all cursor-pointer hover:border-primary-400"
                        >
                            <option value="" className="text-gray-500">All Standards</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(std => (
                                <option key={std} value={std} className="text-gray-900">Standard {std}</option>
                            ))}
                        </select>
                    )}

                    {filterTab === 'subject' && (
                        <select
                            value={subjectFilter || ''}
                            onChange={(e) => setSubjectFilter(e.target.value || null)}
                            className="w-48 bg-white border-2 border-primary-300 rounded-lg px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all cursor-pointer hover:border-primary-400"
                        >
                            <option value="" className="text-gray-500">All Subjects</option>
                            {subjects.map(subject => (
                                <option key={subject.id} value={subject.id} className="text-gray-900">
                                    {subject.subjectName}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Teachers List - Card View */}
            {viewMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map(teacher => (
                        <div key={teacher.id} className="card interactive">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                                    <p className="text-sm text-gray-600">{teacher.email}</p>
                                    <p className="text-sm text-gray-600">{teacher.phone}</p>
                                    {teacher.employeeId && (
                                        <p className="text-xs text-gray-500 mt-1">ID: {teacher.employeeId}</p>
                                    )}
                                </div>
                                {teacher.isClassTeacher && (
                                    <span className="badge badge-primary">Class Teacher</span>
                                )}
                            </div>

                            {teacher.assignedClass && (
                                <div className="mb-3">
                                    <p className="text-sm font-medium text-gray-700">
                                        Class: <span className="text-primary-600">{teacher.assignedClass.className}</span>
                                    </p>
                                </div>
                            )}

                            {teacher.teachingSubjects && teacher.teachingSubjects.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2">Teaching Subjects:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {teacher.teachingSubjects.map(subjectId => {
                                            const subject = subjects.find(s => s.id === subjectId);
                                            return subject ? (
                                                <span key={subjectId} className="badge badge-secondary text-xs">
                                                    {subject.shortCode}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => navigate(`/timetables?teacherId=${teacher.id}`)}
                                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2 text-sm"
                                    title="View Timetable"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Timetable</span>
                                </button>
                                <button
                                    onClick={() => handleEditTeacher(teacher)}
                                    className="btn btn-secondary p-2"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteTeacher(teacher.id)}
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

            {/* Teachers List - Table View */}
            {viewMode === 'table' && (
                <div className="card overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left p-4 font-semibold text-gray-700">Name</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Phone</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Employee ID</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Class</th>
                                <th className="text-left p-4 font-semibold text-gray-700">Subjects</th>
                                <th className="text-right p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map(teacher => (
                                <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{teacher.name}</span>
                                            {teacher.isClassTeacher && (
                                                <span className="badge badge-primary text-xs">CT</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{teacher.email}</td>
                                    <td className="p-4 text-sm text-gray-600">{teacher.phone}</td>
                                    <td className="p-4 text-sm text-gray-600">{teacher.employeeId || '-'}</td>
                                    <td className="p-4 text-sm text-gray-900">
                                        {teacher.assignedClass?.className || '-'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.teachingSubjects?.slice(0, 3).map(subjectId => {
                                                const subject = subjects.find(s => s.id === subjectId);
                                                return subject ? (
                                                    <span key={subjectId} className="badge badge-secondary text-xs">
                                                        {subject.shortCode}
                                                    </span>
                                                ) : null;
                                            })}
                                            {teacher.teachingSubjects && teacher.teachingSubjects.length > 3 && (
                                                <span className="text-xs text-gray-500">+{teacher.teachingSubjects.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/timetables?teacherId=${teacher.id}`)}
                                                className="btn btn-secondary p-2 text-xs"
                                                title="Create/View Timetable"
                                            >
                                                <Calendar className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleEditTeacher(teacher)}
                                                className="btn btn-secondary p-2"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTeacher(teacher.id)}
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

            {filteredTeachers.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No teachers found</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`input ${formErrors.name ? 'border-red-500' : ''}`}
                                    placeholder="John Doe"
                                />
                                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                            </div>

                            {/* Email and Phone */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`input ${formErrors.email ? 'border-red-500' : ''}`}
                                        placeholder="john@example.com (optional)"
                                    />
                                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                            if (value.length <= 10) {
                                                setFormData({ ...formData, phone: value });
                                            }
                                        }}
                                        maxLength={10}
                                        className={`input ${formErrors.phone ? 'border-red-500' : ''}`}
                                        placeholder="1234567890"
                                    />
                                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                                </div>
                            </div>

                            {/* Employee ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                    className="input"
                                    placeholder="EMP001"
                                />
                            </div>

                            {/* Class Teacher Checkbox */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isClassTeacher"
                                    checked={formData.isClassTeacher}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            isClassTeacher: e.target.checked,
                                            assignedClassId: e.target.checked ? formData.assignedClassId : ''
                                        });
                                        // Clear error when unchecking
                                        if (!e.target.checked && formErrors.assignedClassId) {
                                            setFormErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.assignedClassId;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                    className="w-4 h-4 text-primary-600 rounded"
                                />
                                <label htmlFor="isClassTeacher" className="text-sm font-medium text-gray-700">
                                    Assign as Class Teacher
                                </label>
                            </div>

                            {/* Assigned Class */}
                            {formData.isClassTeacher && (
                                <div className="expand-animation">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assigned Class <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.assignedClassId}
                                        onChange={(e) => setFormData({ ...formData, assignedClassId: e.target.value })}
                                        className={`input w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all ${formErrors.assignedClassId ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Select a class</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.className}</option>
                                        ))}
                                    </select>
                                    {formErrors.assignedClassId && <p className="text-red-500 text-xs mt-1">{formErrors.assignedClassId}</p>}
                                </div>
                            )}

                            {/* Teaching Subjects */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teaching Subjects <span className="text-red-500">*</span>
                                </label>
                                <div className={`grid grid-cols-3 gap-2 ${formErrors.teachingSubjects ? 'border-2 border-red-500 rounded-lg p-2' : ''}`}>
                                    {subjects.map(subject => (
                                        <label key={subject.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.teachingSubjects.includes(subject.id)}
                                                onChange={() => toggleSubject(subject.id)}
                                                className="w-4 h-4 text-primary-600 rounded"
                                            />
                                            <span className="text-sm">{subject.subjectName}</span>
                                        </label>
                                    ))}
                                </div>
                                {formErrors.teachingSubjects && <p className="text-red-500 text-xs mt-1">{formErrors.teachingSubjects}</p>}
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleSaveTeacher} className="btn btn-primary flex items-center gap-2" disabled={saving}>
                                <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                                <span>{saving ? 'Saving...' : (editingTeacher ? 'Update' : 'Create') + ' Teacher'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teachers;

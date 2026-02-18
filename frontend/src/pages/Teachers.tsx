import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, Edit2, Trash2, LayoutGrid, Table as TableIcon, RefreshCw, X, Calendar } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import { useTheme } from '../context/ThemeContext';

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
    const { isDarkMode } = useTheme();
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
            <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {/* Sticky Header Skeleton */}
                <div className={`flex-shrink-0 p-4 md:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="animate-pulse">
                        {/* Header skeleton */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex-1">
                                <div className={`h-8 rounded w-32 mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                <div className={`h-4 rounded w-24 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-24 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                <div className={`h-10 w-24 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                                <div className={`h-10 w-32 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            </div>
                        </div>

                        {/* Search and filters skeleton */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className={`flex-1 h-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            <div className={`h-12 w-full md:w-96 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Skeleton */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 md:pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                {/* Name skeleton */}
                                <div className={`h-6 rounded w-3/4 mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                {/* Email skeleton */}
                                <div className={`h-4 rounded w-1/2 mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                {/* Phone skeleton */}
                                <div className={`h-4 rounded w-1/2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                {/* Subjects skeleton */}
                                <div className="flex gap-2 mb-4">
                                    <div className={`h-6 rounded w-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                    <div className={`h-6 rounded w-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                    <div className={`h-6 rounded w-12 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                </div>
                                {/* Buttons skeleton */}
                                <div className={`flex gap-2 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <div className={`flex-1 h-10 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                    <div className={`h-10 w-10 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                    <div className={`h-10 w-10 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Sticky Header Section */}
            <div className={`flex-shrink-0 p-4 md:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Teachers</h1>
                        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{filteredTeachers.length} teachers found</p>
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
                        <button onClick={handleCreateTeacher} className="btn btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span className="hidden md:inline">Add Teacher</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all
                            ${isDarkMode
                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-primary-500'
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                                }`}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} overflow-x-auto`}>
                        <button
                            onClick={() => { setFilterTab('all'); setStandardFilter(null); setSubjectFilter(null); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${filterTab === 'all'
                                ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-primary-600 shadow-sm')
                                : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                                }`}
                        >
                            All Teachers
                        </button>
                        <button
                            onClick={() => { setFilterTab('class'); setSubjectFilter(null); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${filterTab === 'class'
                                ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-primary-600 shadow-sm')
                                : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                                }`}
                        >
                            Class Teachers
                        </button>
                        <button
                            onClick={() => { setFilterTab('subject'); setStandardFilter(null); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${filterTab === 'subject'
                                ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-primary-600 shadow-sm')
                                : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                                }`}
                        >
                            Subject Teachers
                        </button>
                    </div>
                </div>

                {/* Additional Filters - Stack on mobile */}
                {(filterTab !== 'all') && (
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        {filterTab === 'class' && (
                            <div className="w-full md:w-64">
                                <Dropdown
                                    options={[
                                        { id: '', label: 'All Standards' },
                                        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(std => ({
                                            id: std.toString(),
                                            label: `Standard ${std}`
                                        }))
                                    ]}
                                    value={standardFilter?.toString() || ''}
                                    onChange={(value) => setStandardFilter(value ? parseInt(value) : null)}
                                    placeholder="Select Standard"
                                />
                            </div>
                        )}

                        {filterTab === 'subject' && (
                            <div className="w-full md:w-64">
                                <Dropdown
                                    options={[
                                        { id: '', label: 'All Subjects' },
                                        ...subjects.map(subject => ({
                                            id: subject.id,
                                            label: subject.subjectName
                                        }))
                                    ]}
                                    value={subjectFilter || ''}
                                    onChange={(value) => setSubjectFilter(value || null)}
                                    placeholder="Select Subject"
                                />
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 md:pb-8">
                {/* Teachers List - Card View */}
                {viewMode === 'card' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeachers.map(teacher => (
                            <div key={teacher.id} className={`card interactive ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{teacher.name}</h3>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{teacher.email}</p>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{teacher.phone}</p>
                                        {teacher.employeeId && (
                                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>ID: {teacher.employeeId}</p>
                                        )}
                                    </div>
                                    {teacher.isClassTeacher && (
                                        <span className="badge badge-primary">Class Teacher</span>
                                    )}
                                </div>

                                {teacher.assignedClass && (
                                    <div className="mb-3">
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Class: <span className="text-primary-600">{teacher.assignedClass.className}</span>
                                        </p>
                                    </div>
                                )}

                                {teacher.teachingSubjects && teacher.teachingSubjects.length > 0 && (
                                    <div className="mb-4">
                                        <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Teaching Subjects:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.teachingSubjects.map(subjectId => {
                                                const subject = subjects.find(s => s.id === subjectId);
                                                return subject ? (
                                                    <span key={subjectId} className={`badge text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'badge-secondary'}`}>
                                                        {subject.shortCode}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className={`flex items-center gap-2 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <button
                                        onClick={() => navigate(`/timetables?teacherId=${teacher.id}`)}
                                        className={`flex-1 btn flex items-center justify-center gap-2 text-sm ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}
                                        title="View Timetable"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        <span>Timetable</span>
                                    </button>
                                    <button
                                        onClick={() => handleEditTeacher(teacher)}
                                        className={`btn p-2 ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}
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
                    <div className={`card overflow-x-auto ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</th>
                                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
                                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Employee ID</th>
                                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Class</th>
                                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Subjects</th>
                                    <th className={`text-right p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeachers.map(teacher => (
                                    <tr key={teacher.id} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{teacher.name}</span>
                                                {teacher.isClassTeacher && (
                                                    <span className="badge badge-primary text-xs">CT</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{teacher.email}</td>
                                        <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{teacher.phone}</td>
                                        <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{teacher.employeeId || '-'}</td>
                                        <td className={`p-4 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {teacher.assignedClass?.className || '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {teacher.teachingSubjects?.slice(0, 3).map(subjectId => {
                                                    const subject = subjects.find(s => s.id === subjectId);
                                                    return subject ? (
                                                        <span key={subjectId} className={`badge text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'badge-secondary'}`}>
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
                                                    className={`btn p-2 text-xs ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}
                                                    title="Create/View Timetable"
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleEditTeacher(teacher)}
                                                    className={`btn p-2 ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}
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
                        <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Name */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`input ${formErrors.name ? 'border-red-500' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        placeholder="John Doe"
                                    />
                                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                                </div>

                                {/* Email and Phone */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`input ${formErrors.email ? 'border-red-500' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                            placeholder="john@example.com (optional)"
                                        />
                                        {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            maxLength={10}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setFormData({ ...formData, phone: value });
                                            }}
                                            className={`input ${formErrors.phone ? 'border-red-500' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                            placeholder="1234567890"
                                        />
                                        {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                                    </div>
                                </div>

                                {/* Employee ID */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Employee ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                        className={`input ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                        placeholder="EMP001 (optional)"
                                    />
                                </div>

                                {/* Class Teacher Assignment */}
                                <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <input
                                            type="checkbox"
                                            id="isClassTeacher"
                                            checked={formData.isClassTeacher}
                                            onChange={(e) => {
                                                const isChecked = e.target.checked;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    isClassTeacher: isChecked,
                                                    assignedClassId: isChecked ? prev.assignedClassId : ''
                                                }));
                                                if (!isChecked) {
                                                    const newErrors = { ...formErrors };
                                                    delete newErrors.assignedClassId;
                                                    setFormErrors(newErrors);
                                                }
                                            }}
                                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                        />
                                        <label htmlFor="isClassTeacher" className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Assign as Class Teacher
                                        </label>
                                    </div>

                                    <div className={`grid transition-all duration-300 ease-in-out ${formData.isClassTeacher ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                        <div className="overflow-hidden">
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Assigned Class <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.assignedClassId}
                                                onChange={(e) => setFormData({ ...formData, assignedClassId: e.target.value })}
                                                className={`input ${formErrors.assignedClassId ? 'border-red-500' : ''} ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                                            >
                                                <option value="">Select Class</option>
                                                {classes.map((cls) => (
                                                    <option key={cls.id} value={cls.id}>
                                                        {cls.className}
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.assignedClassId && <p className="text-red-500 text-xs mt-1">{formErrors.assignedClassId}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Teaching Subjects */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Teaching Subjects <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`border rounded-lg p-4 max-h-48 overflow-y-auto grid grid-cols-2 gap-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                        {subjects.map((subject) => (
                                            <label key={subject.id} className={`flex items-center gap-2 p-2 rounded hover:bg-opacity-50 cursor-pointer ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.teachingSubjects.includes(subject.id)}
                                                    onChange={() => toggleSubject(subject.id)}
                                                    className="rounded text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{subject.subjectName}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {formErrors.teachingSubjects && <p className="text-red-500 text-xs mt-1">{formErrors.teachingSubjects}</p>}
                                </div>
                            </div>

                            <div className={`p-6 border-t flex justify-end gap-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className={`btn ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTeacher}
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Teacher'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Teachers;

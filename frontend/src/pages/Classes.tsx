import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Save, Users, Search, RefreshCw, LayoutGrid, Table as TableIcon, Calendar, Filter } from 'lucide-react';
import Autocomplete from '../components/Autocomplete';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-hot-toast';

interface Class {
    id: string;
    className: string;
    standard: number;
    division: string;
    classTeacherId?: string;
    numberOfStudents?: number;
    classTeacher?: {
        id: string;
        name: string;
    };
}

interface Teacher {
    id: string;
    name: string;
    isClassTeacher: boolean;
}

const Classes: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStandardTab, setSelectedStandardTab] = useState<number | 'all'>('all');
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [showAllPreview, setShowAllPreview] = useState(false);
    const [showFilterSheet, setShowFilterSheet] = useState(false);

    // Bulk creation state
    const [selectedStandards, setSelectedStandards] = useState<number[]>([]);
    const [divisions, setDivisions] = useState<string[]>(['Rose', 'Lily', 'Marigold', 'Jasmine']);

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        classTeacherId: '',
        numberOfStudents: ''
    });

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await api.get('/classes');
            setClasses(response.data.classes);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get('/teachers');
            setTeachers(response.data.teachers);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchClasses();
    };

    const handleBulkCreate = async () => {
        if (selectedStandards.length === 0 || divisions.length === 0) {
            toast.error('Please select at least one standard and one division');
            return;
        }

        try {
            await api.post('/classes/bulk', {
                standards: selectedStandards,
                divisions: divisions
            });
            setShowBulkModal(false);
            setSelectedStandards([]);
            setShowAllPreview(false);
            fetchClasses();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create classes');
        }
    };

    const handleEditClass = (cls: Class) => {
        setEditingClass(cls);
        setEditFormData({
            classTeacherId: cls.classTeacherId || '',
            numberOfStudents: cls.numberOfStudents?.toString() || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateClass = async () => {
        if (!editingClass) return;

        try {
            await api.put(`/classes/${editingClass.id}`, {
                classTeacherId: editFormData.classTeacherId || null,
                numberOfStudents: editFormData.numberOfStudents ? parseInt(editFormData.numberOfStudents) : null
            });
            setShowEditModal(false);
            fetchClasses();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update class');
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm('Are you sure you want to delete this class?')) return;

        try {
            await api.delete(`/classes/${id}`);
            fetchClasses();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete class');
        }
    };

    const toggleStandard = (std: number) => {
        setSelectedStandards(prev =>
            prev.includes(std) ? prev.filter(s => s !== std) : [...prev, std]
        );
    };

    const toggleDivision = (div: string) => {
        setDivisions(prev =>
            prev.includes(div) ? prev.filter(d => d !== div) : [...prev, div]
        );
    };

    // Filter classes
    const filteredClasses = classes.filter(cls => {
        const matchesSearch = cls.className.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStandard = selectedStandardTab === 'all' || cls.standard === selectedStandardTab;
        return matchesSearch && matchesStandard;
    });

    // Group classes by standard
    const groupedClasses = filteredClasses.reduce((acc, cls) => {
        if (!acc[cls.standard]) acc[cls.standard] = [];
        acc[cls.standard].push(cls);
        return acc;
    }, {} as Record<number, Class[]>);

    // Preview classes
    const previewClasses = [];
    for (const std of selectedStandards) {
        for (const div of divisions) {
            previewClasses.push(`${std}-${div}`);
        }
    }

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

                        {/* Search skeleton */}
                        <div className={`h-12 rounded-lg w-full mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>

                        {/* Filter tabs skeleton */}
                        <div className="flex gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`h-10 rounded w-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Skeleton */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 md:pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className={`h-6 rounded w-3/4 mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                <div className={`h-4 rounded w-1/2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                <div className="flex flex-col gap-2">
                                    <div className={`h-8 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                    <div className="flex gap-2">
                                        <div className={`h-8 rounded flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                        <div className={`h-8 rounded w-10 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                    </div>
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
                        <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Classes</h1>
                        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{filteredClasses.length} of {classes.length} classes</p>
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
                        <button onClick={() => setShowBulkModal(true)} className="btn btn-primary flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span className="hidden md:inline">Bulk Create</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        placeholder="Search classes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all
                        ${isDarkMode
                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-primary-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                            }`}
                    />
                </div>

                {/* Standard Tabs - Desktop */}
                <div className="hidden md:flex items-center gap-2 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setSelectedStandardTab('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${selectedStandardTab === 'all'
                            ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-primary-600 shadow-sm')
                            : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                            }`}
                    >
                        All
                    </button>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(std => (
                        <button
                            key={std}
                            onClick={() => setSelectedStandardTab(std)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${selectedStandardTab === std
                                ? (isDarkMode ? 'bg-gray-700 text-white shadow-sm' : 'bg-white text-primary-600 shadow-sm')
                                : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                                }`}
                        >
                            Standard {std}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-24 md:pb-8">

                {/* Card View */}
                {viewMode === 'card' && Object.keys(groupedClasses).length > 0 && (
                    <div className="space-y-6">
                        {Object.keys(groupedClasses).sort((a, b) => parseInt(a) - parseInt(b)).map(standard => (
                            <div key={standard} className={`rounded-xl p-4 md:p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Standard {standard}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {groupedClasses[parseInt(standard)].map(cls => (
                                        <div key={cls.id} className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-white border-gray-200 hover:border-primary-200'}`}>
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cls.className}</h3>
                                                    {cls.classTeacher && (
                                                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            CT: {cls.classTeacher.name}
                                                        </p>
                                                    )}
                                                    {cls.numberOfStudents && (
                                                        <p className={`text-xs mt-1 flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            <Users className="w-3 h-3" />
                                                            {cls.numberOfStudents} students
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`flex flex-col gap-2 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                                                <button
                                                    onClick={() => navigate(`/timetables?classId=${cls.id}`)}
                                                    className={`btn flex items-center justify-center gap-2 text-sm w-full ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                >
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Timetable</span>
                                                </button>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditClass(cls)}
                                                        className={`flex-1 btn flex items-center justify-center gap-2 text-sm ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        <span>Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClass(cls.id)}
                                                        className="btn bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && filteredClasses.length > 0 && (
                    <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Class</th>
                                        <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Standard</th>
                                        <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Division</th>
                                        <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Class Teacher</th>
                                        <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Students</th>
                                        <th className={`text-right p-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClasses.map(cls => (
                                        <tr key={cls.id} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                                            <td className={`p-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cls.className}</td>
                                            <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{cls.standard}</td>
                                            <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{cls.division}</td>
                                            <td className={`p-4 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {cls.classTeacher?.name || <span className="text-gray-400">Not assigned</span>}
                                            </td>
                                            <td className={`p-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {cls.numberOfStudents || <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/timetables?classId=${cls.id}`)}
                                                        className={`btn p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                                                        title="Create/View Timetable"
                                                    >
                                                        <Calendar className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClass(cls)}
                                                        className={`btn p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClass(cls.id)}
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

                {filteredClasses.length === 0 && (
                    <div className={`rounded-xl p-12 text-center border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No classes found</p>
                        <button onClick={() => setShowBulkModal(true)} className="btn btn-primary inline-flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span>Create Classes</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Filter Button */}
            <div className="md:hidden fixed bottom-24 right-4 z-30">
                <button
                    onClick={() => setShowFilterSheet(true)}
                    className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                >
                    <Filter className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Filter Sheet */}
            {showFilterSheet && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setShowFilterSheet(false)}
                    />
                    <div className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-6 transform transition-transform duration-300 md:hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} pb-safe`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Filter by Standard</h3>
                            <button
                                onClick={() => setShowFilterSheet(false)}
                                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <button
                                onClick={() => {
                                    setSelectedStandardTab('all');
                                    setShowFilterSheet(false);
                                }}
                                className={`p-3 rounded-lg font-medium text-sm transition-colors ${selectedStandardTab === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                                    }`}
                            >
                                All
                            </button>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(std => (
                                <button
                                    key={std}
                                    onClick={() => {
                                        setSelectedStandardTab(std);
                                        setShowFilterSheet(false);
                                    }}
                                    className={`p-3 rounded-lg font-medium text-sm transition-colors ${selectedStandardTab === std
                                        ? 'bg-primary-600 text-white'
                                        : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                                        }`}
                                >
                                    Std {std}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Bulk Create Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
                    <div className={`rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className={`sticky top-0 border-b px-6 py-4 flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bulk Create Classes</h2>
                            <button onClick={() => setShowBulkModal(false)} className={`hover:text-gray-600 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400'}`}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Select Standards */}
                            <div>
                                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Select Standards <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(std => (
                                        <button
                                            key={std}
                                            onClick={() => toggleStandard(std)}
                                            className={`p-3 rounded-lg border-2 font-medium transition-all ${selectedStandards.includes(std)
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : (isDarkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300')
                                                }`}
                                        >
                                            {std}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Select Divisions */}
                            <div>
                                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Select Divisions <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Rose', 'Lily', 'Marigold', 'Jasmine', 'Lotus', 'Sunflower', 'Tulip'].map(div => (
                                        <button
                                            key={div}
                                            onClick={() => toggleDivision(div)}
                                            className={`p-3 rounded-lg border-2 font-medium transition-all ${divisions.includes(div)
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : (isDarkMode ? 'border-gray-600 text-gray-300 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300')
                                                }`}
                                        >
                                            {div}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            {selectedStandards.length > 0 && divisions.length > 0 && (
                                <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                                    <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                                        Will create {selectedStandards.length * divisions.length} classes:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(showAllPreview ? previewClasses : previewClasses.slice(0, 9)).map(className => (
                                            <span key={className} className="badge badge-primary text-xs">
                                                {className}
                                            </span>
                                        ))}
                                        {previewClasses.length > 9 && !showAllPreview && (
                                            <button
                                                onClick={() => setShowAllPreview(true)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                +{previewClasses.length - 9} more
                                            </button>
                                        )}
                                        {showAllPreview && previewClasses.length > 9 && (
                                            <button
                                                onClick={() => setShowAllPreview(false)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Show less
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={`sticky bottom-0 px-6 py-4 flex items-center justify-end gap-3 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <button onClick={() => setShowBulkModal(false)} className={`btn ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}>
                                Cancel
                            </button>
                            <button onClick={handleBulkCreate} className="btn btn-primary flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                <span>Create {selectedStandards.length * divisions.length} Classes</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Class Modal */}
            {showEditModal && editingClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
                    <div className={`rounded-xl shadow-2xl max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className={`border-b px-6 py-4 flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit {editingClass.className}</h2>
                            <button onClick={() => setShowEditModal(false)} className={`hover:text-gray-600 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400'}`}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Class Teacher */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Class Teacher
                                </label>
                                <Autocomplete
                                    options={[
                                        { id: '', label: 'No Class Teacher' },
                                        ...teachers
                                            .filter(t => !t.isClassTeacher || t.id === editingClass.classTeacherId)
                                            .map(teacher => ({
                                                id: teacher.id,
                                                label: teacher.name
                                            }))
                                    ]}
                                    value={editFormData.classTeacherId}
                                    onChange={(value) => setEditFormData({ ...editFormData, classTeacherId: value })}
                                    placeholder="Search for a teacher..."
                                />
                            </div>

                            {/* Number of Students */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Number of Students
                                </label>
                                <input
                                    type="number"
                                    value={editFormData.numberOfStudents}
                                    onChange={(e) => setEditFormData({ ...editFormData, numberOfStudents: e.target.value })}
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
                                    placeholder="e.g., 40"
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className={`px-6 py-4 flex items-center justify-end gap-3 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                            <button onClick={() => setShowEditModal(false)} className={`btn ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'btn-secondary'}`}>
                                Cancel
                            </button>
                            <button onClick={handleUpdateClass} className="btn btn-primary flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                <span>Update Class</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;

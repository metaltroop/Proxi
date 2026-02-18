import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Download, CheckSquare, Square, Filter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Class {
    id: string;
    className: string;
    standard: number;
    division: string;
}

interface Teacher {
    id: string;
    name: string;
    employeeId: string | null;
}

const BulkDownload: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState<'classes' | 'teachers'>('classes');

    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
    const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [classesRes, teachersRes] = await Promise.all([
                api.get('/classes'),
                api.get('/teachers')
            ]);
            setClasses(classesRes.data.classes);
            setTeachers(teachersRes.data.teachers);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: string, type: 'classes' | 'teachers') => {
        if (type === 'classes') {
            const newSet = new Set(selectedClasses);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            setSelectedClasses(newSet);
        } else {
            const newSet = new Set(selectedTeachers);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            setSelectedTeachers(newSet);
        }
    };

    const toggleAll = (type: 'classes' | 'teachers') => {
        if (type === 'classes') {
            if (selectedClasses.size === classes.length) {
                setSelectedClasses(new Set());
            } else {
                setSelectedClasses(new Set(classes.map(c => c.id)));
            }
        } else {
            if (selectedTeachers.size === teachers.length) {
                setSelectedTeachers(new Set());
            } else {
                setSelectedTeachers(new Set(teachers.map(t => t.id)));
            }
        }
    };

    const handleDownload = async () => {
        if (selectedClasses.size === 0 && selectedTeachers.size === 0) {
            alert('Please select at least one item');
            return;
        }

        setDownloading(true);
        try {
            const response = await api.post('/timetables/download-bulk-pdf', {
                classIds: Array.from(selectedClasses),
                teacherIds: Array.from(selectedTeachers)
            }, {
                responseType: 'blob'
            });

            // Create blob link to download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'bulk_timetables.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download PDF');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const currentList = activeTab === 'classes' ? classes : teachers;
    const currentSelection = activeTab === 'classes' ? selectedClasses : selectedTeachers;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className={`p-4 md:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/timetables')}
                        className={`p-2 rounded-full hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-800' : ''}`}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Bulk Timetable Download</h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Select multiple classes or teachers to generate a single PDF
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar / Tabs */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                        <button
                            onClick={() => setActiveTab('classes')}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${activeTab === 'classes'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50 border')
                                }`}
                        >
                            <span className="font-medium">Classes</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'classes' ? 'bg-primary-500' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                }`}>
                                {selectedClasses.size}
                            </span>
                        </button>

                        <button
                            onClick={() => setActiveTab('teachers')}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${activeTab === 'teachers'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50 border')
                                }`}
                        >
                            <span className="font-medium">Teachers</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'teachers' ? 'bg-primary-500' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                                }`}>
                                {selectedTeachers.size}
                            </span>
                        </button>

                        <div className={`mt-6 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                            <h3 className="font-semibold mb-2">Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Classes selected:</span>
                                    <span className="font-medium">{selectedClasses.size}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Teachers selected:</span>
                                    <span className="font-medium">{selectedTeachers.size}</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading || (selectedClasses.size === 0 && selectedTeachers.size === 0)}
                                        className="w-full btn btn-primary flex items-center justify-center gap-2"
                                    >
                                        <Download className={`w-4 h-4 ${downloading ? 'animate-spin' : ''}`} />
                                        {downloading ? 'Generating...' : 'Download PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            {/* Toolbar */}
                            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-100 bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleAll(activeTab)}
                                        className="flex items-center gap-2 text-sm font-medium hover:text-primary-600 transition-colors"
                                    >
                                        {currentSelection.size === currentList.length ? (
                                            <CheckSquare className="w-5 h-5 text-primary-600" />
                                        ) : (
                                            <Square className="w-5 h-5 text-gray-400" />
                                        )}
                                        Select All
                                    </button>
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {currentSelection.size} of {currentList.length} selected
                                    </span>
                                </div>

                                <div className="relative">
                                    <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Filter list..."
                                        className={`pl-10 pr-4 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* List */}
                            <div className="max-h-[600px] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:gap-4 p-4">
                                    {currentList.map((item: any) => {
                                        const isSelected = currentSelection.has(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleSelection(item.id, activeTab)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                        ? (isDarkMode ? 'bg-primary-900/30 border-primary-500' : 'bg-primary-50 border-primary-200')
                                                        : (isDarkMode ? 'bg-gray-700/30 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm')
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex-shrink-0 ${isSelected ? 'text-primary-600' : 'text-gray-300'}`}>
                                                        {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                            {activeTab === 'classes' ? item.className : item.name}
                                                        </div>
                                                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {activeTab === 'classes'
                                                                ? `Std ${item.standard} - ${item.division}`
                                                                : (item.employeeId || 'No ID')
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkDownload;

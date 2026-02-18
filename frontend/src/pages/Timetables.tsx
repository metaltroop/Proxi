import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Save, X, Plus, Edit, Check, Download, ChevronDown, ChevronUp } from 'lucide-react';
import Autocomplete from '../components/Autocomplete';
import Dropdown from '../components/Dropdown';
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
    phone?: string;
    teachingSubjects?: string[];
}

interface Subject {
    id: string;
    subjectName: string;
    shortCode: string;
}

interface Period {
    id: string;
    periodNo: number;
    startTime: string;
    endTime: string;
    periodType: string;
}

interface TimetableEntry {
    id?: string;
    classId: string;
    teacherId: string;
    subjectId: string;
    periodId: string;
    dayOfWeek: number;
}

interface TempAssignment {
    day: number;
    periodId: string;
    subjectId: string;
    teacherId?: string;
    classId?: string;
}

interface PendingDeletion {
    entryId: string;
    day: number;
    periodId: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetables: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [periods, setPeriods] = useState<Period[]>([]);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingTimetable, setFetchingTimetable] = useState(false);

    const [searchType, setSearchType] = useState<'class' | 'teacher'>('class');
    const [selectedId, setSelectedId] = useState<string>('');
    const [isLocked, setIsLocked] = useState(false);
    const [timetableExists, setTimetableExists] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [bulkSubjectId, setBulkSubjectId] = useState('');
    const [bulkClassId, setBulkClassId] = useState('');
    const [bulkTeacherId, setBulkTeacherId] = useState('');
    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [tempAssignments, setTempAssignments] = useState<TempAssignment[]>([]);
    const [pendingDeletions, setPendingDeletions] = useState<PendingDeletion[]>([]);
    const [isSearchExpanded, setIsSearchExpanded] = useState(true);
    const [isBulkExpanded, setIsBulkExpanded] = useState(false);

    // Mobile state
    const [selectedDay, setSelectedDay] = useState(0); // Monday by default
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [overflowVisible, setOverflowVisible] = useState(false);

    useEffect(() => {
        if (isSearchExpanded) {
            const timer = setTimeout(() => setOverflowVisible(true), 300);
            return () => clearTimeout(timer);
        } else {
            setOverflowVisible(false);
        }
    }, [isSearchExpanded]);

    useEffect(() => {
        fetchData();
        const classId = searchParams.get('classId');
        const teacherId = searchParams.get('teacherId');
        if (classId) {
            setSearchType('class');
            setSelectedId(classId);
            setIsLocked(true);
        } else if (teacherId) {
            setSearchType('teacher');
            setSelectedId(teacherId);
            setIsLocked(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (isLocked) {
            checkAndFetchTimetable();
        }
    }, [isLocked, selectedId, searchType]);

    const fetchData = async () => {
        try {
            const [classesRes, teachersRes, subjectsRes, periodsRes] = await Promise.all([
                api.get('/classes'),
                api.get('/teachers'),
                api.get('/subjects'),
                api.get('/periods')
            ]);
            setClasses(classesRes.data.classes);
            setTeachers(teachersRes.data.teachers);
            setSubjects(subjectsRes.data.subjects);
            setPeriods(periodsRes.data.periods);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAndFetchTimetable = async () => {
        if (!selectedId) return;
        setFetchingTimetable(true);
        try {
            const response = await api.get('/timetables', {
                params: searchType === 'class'
                    ? { classId: selectedId }
                    : { teacherId: selectedId }
            });
            console.log('Timetable API Response:', response.data);
            console.log('Timetable length:', response.data.timetable.length);
            setTimetable(response.data.timetable);
            setTimetableExists(response.data.timetable.length > 0);
            setIsSearchExpanded(false); // Auto-collapse search on success
            console.log('timetableExists set to:', response.data.timetable.length > 0);
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
            setTimetableExists(false);
        } finally {
            setFetchingTimetable(false);
        }
    };

    const handleSearch = () => {
        setIsLocked(true);
    };

    const handleUnlock = () => {
        setIsLocked(false);
        setSelectedId('');
        setTimetable([]);
        setTimetableExists(false);
        setIsEditing(false);
        setTempAssignments([]);
        setPendingDeletions([]);
        setSelectedCells(new Set());
    };

    const handleCreateTimetable = () => {
        setIsEditing(true);
    };

    const getCellKey = (day: number, periodId: string) => `${day}_${periodId}`;

    const getTimetableEntry = (day: number, periodId: string) =>
        timetable.find(e => e.dayOfWeek === day && e.periodId === periodId);

    const getTempAssignment = (day: number, periodId: string) =>
        tempAssignments.find(a => a.day === day && a.periodId === periodId);

    const isPendingDeletion = (day: number, periodId: string) =>
        pendingDeletions.some(d => d.day === day && d.periodId === periodId);

    const handleCellClick = (day: number, periodId: string) => {
        if (!isEditing) return;
        const entry = getTimetableEntry(day, periodId);
        const tempEntry = getTempAssignment(day, periodId);
        if (entry || tempEntry) return;

        const cellKey = getCellKey(day, periodId);
        const newSelected = new Set(selectedCells);
        if (newSelected.has(cellKey)) {
            newSelected.delete(cellKey);
        } else {
            newSelected.add(cellKey);
        }
        setSelectedCells(newSelected);
    };

    const handleAddAssignments = () => {
        if (!bulkSubjectId) {
            alert('Please select a subject');
            return;
        }
        if (searchType === 'teacher' && !bulkClassId) {
            alert('Please select a class');
            return;
        }
        if (searchType === 'class' && !bulkTeacherId) {
            alert('Please select a teacher');
            return;
        }
        const newAssignments: TempAssignment[] = [];
        selectedCells.forEach(cellKey => {
            const [day, periodId] = cellKey.split('_');
            newAssignments.push({
                day: parseInt(day),
                periodId,
                subjectId: bulkSubjectId,
                teacherId: searchType === 'class' ? bulkTeacherId : selectedId,
                classId: searchType === 'teacher' ? bulkClassId : selectedId
            });
        });
        setTempAssignments([...tempAssignments, ...newAssignments]);
        setSelectedCells(new Set());
        setBulkSubjectId('');
        setBulkClassId('');
        setBulkTeacherId('');
    };

    const handleSaveAll = async () => {
        if (tempAssignments.length === 0 && pendingDeletions.length === 0) {
            alert('No changes to save');
            return;
        }
        try {
            if (pendingDeletions.length > 0) {
                await Promise.all(pendingDeletions.map(d => api.delete(`/timetables/${d.entryId}`)));
            }

            if (tempAssignments.length > 0) {
                await Promise.all(tempAssignments.map(assignment =>
                    api.post('/timetables', {
                        classId: assignment.classId,
                        teacherId: assignment.teacherId,
                        subjectId: assignment.subjectId,
                        periodId: assignment.periodId,
                        dayOfWeek: assignment.day
                    })
                ));
            }

            setTempAssignments([]);
            setPendingDeletions([]);
            setIsEditing(false);
            checkAndFetchTimetable();
            alert('Timetable saved successfully!');
        } catch (error: any) {
            console.error('Save error:', error);
            alert(error.response?.data?.error || 'Failed to save timetable');
        }
    };

    const handleDeleteTemp = (day: number, periodId: string) => {
        setTempAssignments(tempAssignments.filter(a => !(a.day === day && a.periodId === periodId)));
    };

    const handleDeleteEntry = (entryId: string, day: number, periodId: string) => {
        setPendingDeletions([...pendingDeletions, { entryId, day, periodId }]);
    };

    const handleUndoDelete = (day: number, periodId: string) => {
        setPendingDeletions(pendingDeletions.filter(d => !(d.day === day && d.periodId === periodId)));
    };

    const getTeacherName = (teacherId: string) => teachers.find(t => t.id === teacherId)?.name || '';
    const getSubjectCode = (subjectId: string) => subjects.find(s => s.id === subjectId)?.shortCode || '';

    const getClassDisplay = (classId: string) => {
        const cls = classes.find(c => c.id === classId);
        return cls ? `${cls.standard}${cls.division.charAt(0)}` : '';
    };

    const autocompleteOptions = searchType === 'class'
        ? classes.map(cls => ({ id: cls.id, label: cls.className, sublabel: `Standard ${cls.standard} - ${cls.division}` }))
        : teachers.map(teacher => ({
            id: teacher.id,
            label: teacher.name,
            sublabel: teacher.employeeId ? `ID: ${teacher.employeeId}` : (teacher.phone || '')
        }));

    const getFilteredSubjects = () => {
        if (searchType === 'teacher') {
            const teacher = teachers.find(t => t.id === selectedId);
            if (teacher?.teachingSubjects && teacher.teachingSubjects.length > 0) {
                return subjects.filter(s => teacher.teachingSubjects!.includes(s.id));
            }
        }
        return subjects;
    };

    const subjectOptions = getFilteredSubjects().map(s => ({ id: s.id, label: `${s.subjectName} (${s.shortCode})` }));
    const classOptions = classes.map(c => ({ id: c.id, label: c.className }));
    const teacherOptions = teachers.map(t => ({ id: t.id, label: t.name }));

    const handleDownloadPdf = async () => {
        if (downloadingPdf) return; // Prevent multiple clicks

        setDownloadingPdf(true);
        try {
            const response = await api.get('/timetables/download-pdf', {
                params: searchType === 'class'
                    ? { classId: selectedId }
                    : { teacherId: selectedId },
                responseType: 'blob'
            });

            // Create blob link to download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from Content-Disposition header
            const contentDisposition = response.headers['content-disposition'];
            let fileName = 'timetable.pdf';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1].replace(/['"]/g, '');
                }
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Delay revocation to ensure download starts
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('Download PDF error:', error);
            alert('Failed to download PDF');
        } finally {
            setDownloadingPdf(false);
        }
    };

    const getSelectedName = () => {
        if (searchType === 'class') {
            const cls = classes.find(c => c.id === selectedId);
            return cls ? cls.className : '';
        } else {
            const teacher = teachers.find(t => t.id === selectedId);
            return teacher ? teacher.name : '';
        }
    };

    if (loading) {
        return (
            <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`flex-shrink-0 p-4 md:p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    {/* Header Skeleton */}
                    <div className="mb-6 animate-pulse">
                        <div className={`h-8 rounded w-64 mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        <div className={`h-4 rounded w-48 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    </div>

                    {/* Search Section Skeleton */}
                    <div className={`rounded-xl p-6 border mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="animate-pulse space-y-4">
                            <div className="flex items-center gap-4">
                                <div className={`h-4 rounded w-20 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                <div className={`h-10 rounded-xl w-48 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                            </div>
                            <div className={`h-12 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                            <div className={`h-10 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Content Area Skeleton */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
                    <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="animate-pulse space-y-3">
                            <div className={`h-12 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-16 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Print Styles Removed - Using Backend PDF Generation */}

            <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                {/* Header */}
                <div className={`p-4 md:p-8 no-print ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Timetable Management</h1>
                            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Create and manage class timetables</p>
                        </div>
                        <button
                            onClick={() => navigate('/timetables/bulk')}
                            className={`btn btn-secondary flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : ''}`}
                        >
                            <Download className="w-5 h-5" />
                            Bulk Download
                        </button>
                    </div>

                    <div className={`rounded-xl border mb-6 transition-all duration-200 relative z-20 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        >
                            <div className="flex items-center gap-2">
                                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Search
                                </h2>
                                {!isSearchExpanded && selectedId && (
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        - {getSelectedName()}
                                    </span>
                                )}
                            </div>
                            {isSearchExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>

                        <div className={`transition-all duration-300 ease-ios ${isSearchExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}>
                            <div className="p-6 pt-0 space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Search by:</label>
                                    <div className={`flex items-center rounded-xl p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <button onClick={(e) => { e.stopPropagation(); !isLocked && setSearchType('class'); }} disabled={isLocked}
                                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${searchType === 'class' ? (isDarkMode ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-primary-600') : (isDarkMode ? 'text-gray-300' : 'text-gray-600')} ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}>
                                            Class
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); !isLocked && setSearchType('teacher'); }} disabled={isLocked}
                                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${searchType === 'teacher' ? (isDarkMode ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-primary-600') : (isDarkMode ? 'text-gray-300' : 'text-gray-600')} ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}>
                                            Teacher
                                        </button>
                                    </div>
                                </div>
                                <Autocomplete options={autocompleteOptions} value={selectedId} onChange={setSelectedId}
                                    placeholder={`Search for a ${searchType}...`} locked={isLocked} onUnlock={handleUnlock} onSearch={() => { }} />
                                {!isLocked && selectedId && (
                                    <button onClick={handleSearch} className="btn btn-primary w-full flex items-center justify-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Load Timetable
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isLocked && isEditing && (
                        <div className={`rounded-xl border mb-6 transition-all duration-200 relative z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer "
                                onClick={() => setIsBulkExpanded(!isBulkExpanded)}
                            >
                                <div className="flex items-center gap-2">
                                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bulk Assignment</h2>
                                    {!isBulkExpanded && selectedCells.size > 0 && (
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                            {selectedCells.size} cells selected
                                        </span>
                                    )}
                                </div>
                                {isBulkExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>

                            <div className={`transition-all duration-300 ease-ios ${isBulkExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-6 pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <Dropdown options={subjectOptions} value={bulkSubjectId} onChange={setBulkSubjectId}
                                            placeholder="Select Subject" label="Subject" required />
                                        {searchType === 'teacher' && (
                                            <Dropdown options={classOptions} value={bulkClassId} onChange={setBulkClassId}
                                                placeholder="Select Class" label="Class" required />
                                        )}
                                        {searchType === 'class' && (
                                            <Dropdown options={teacherOptions} value={bulkTeacherId} onChange={setBulkTeacherId}
                                                placeholder="Select Teacher" label="Teacher" required />
                                        )}
                                        <div className="flex items-end">
                                            <button onClick={handleAddAssignments} disabled={selectedCells.size === 0}
                                                className="btn btn-primary w-full flex items-center justify-center gap-2">
                                                <Plus className="w-5 h-5" />
                                                Add ({selectedCells.size} cells)
                                            </button>
                                        </div>
                                    </div>
                                    {selectedCells.size > 0 && (
                                        <p className={`text-sm mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Click cells in the grid to select/deselect them for bulk assignment
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {isLocked && !fetchingTimetable && !isEditing && (
                        <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {timetableExists ? 'Timetable' : 'No Timetable Found'}
                                    </h2>
                                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {timetableExists
                                            ? 'View-only mode'
                                            : (searchType === 'teacher' ? 'Create a new timetable to get started' : 'No timetable found')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {timetableExists && (
                                        <>
                                            <button
                                                onClick={handleDownloadPdf}
                                                className="btn btn-secondary flex items-center gap-2 flex-1 md:flex-none"
                                                disabled={downloadingPdf}
                                            >
                                                <Download className={`w-5 h-5 ${downloadingPdf ? 'animate-spin' : ''}`} />
                                                {downloadingPdf ? 'Downloading...' : 'Download PDF'}
                                            </button>
                                            <button onClick={() => setIsEditing(true)} className="btn btn-primary flex items-center gap-2 flex-1 md:flex-none">
                                                <Edit className="w-5 h-5" />
                                                Edit
                                            </button>
                                        </>
                                    )}
                                    {!timetableExists && searchType === 'teacher' && (
                                        <button onClick={handleCreateTimetable} className="btn btn-primary flex items-center gap-2 w-full md:w-auto">
                                            <Plus className="w-5 h-5" />
                                            Create Timetable
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-4 md:px-8 pb-24">
                    {/* Empty State - No Search Performed */}
                    {!isLocked && (
                        <div className={`rounded-xl p-12 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex flex-col items-center justify-center text-center space-y-6">
                                {/* Animated Icon */}
                                <div className="relative">
                                    <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${isDarkMode ? 'bg-primary-500' : 'bg-primary-300'} animate-pulse`}></div>
                                    <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <Calendar className={`w-12 h-12 ${isDarkMode ? 'text-primary-400' : 'text-primary-600'} animate-bounce`} style={{ animationDuration: '2s' }} />
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className="space-y-2">
                                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        No Timetable Selected
                                    </h3>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md`}>
                                        Search for a class or teacher above to view and manage their timetable
                                    </p>
                                </div>

                                {/* Floating Elements */}
                                <div className="flex gap-4 mt-4">
                                    <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} animate-pulse`} style={{ animationDelay: '0s', animationDuration: '3s' }}>
                                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>📚 Classes</span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} animate-pulse`} style={{ animationDelay: '1s', animationDuration: '3s' }}>
                                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>👨‍🏫 Teachers</span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} animate-pulse`} style={{ animationDelay: '2s', animationDuration: '3s' }}>
                                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>⏰ Periods</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLocked && fetchingTimetable && (
                        <div className={`rounded-xl p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="animate-pulse space-y-3">
                                <div className={`h-12 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-16 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile View - Day Tabs + Period Cards */}
                    {isLocked && !fetchingTimetable && (timetableExists || isEditing) && (
                        <>
                            {/* Mobile View - 3 Day Range */}
                            <div className="md:hidden no-print">
                                {/* Navigation Header - Segmented Control */}
                                <div className={`flex p-1 mb-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                                    <button
                                        onClick={() => setSelectedDay(0)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${selectedDay === 0
                                            ? (isDarkMode ? 'bg-gray-600 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5')
                                            : (isDarkMode ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-500 hover:bg-gray-200/50')
                                            }`}
                                    >
                                        Mon - Wed
                                    </button>
                                    <button
                                        onClick={() => setSelectedDay(3)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${selectedDay >= 3
                                            ? (isDarkMode ? 'bg-gray-600 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5')
                                            : (isDarkMode ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-500 hover:bg-gray-200/50')
                                            }`}
                                    >
                                        Thu - Sat
                                    </button>
                                </div>

                                {/* 3-Day Grid */}
                                <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className={`border p-2 text-left font-semibold min-w-[60px] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                                                        <div className="text-[10px] uppercase tracking-wider">Time</div>
                                                    </th>
                                                    {DAYS.slice(Math.floor(selectedDay / 3) * 3, Math.floor(selectedDay / 3) * 3 + 3).map(day => (
                                                        <th key={day} className={`border p-2 text-center font-semibold min-w-[100px] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                                                            <div className="text-xs">{day.slice(0, 3)}</div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {periods.map(period => (
                                                    <tr key={period.id}>
                                                        <td className={`border p-2 font-medium ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                                                            <div className="text-xs font-bold">{period.periodNo === 0 ? 'RECESS' : `P${period.periodNo}`}</div>
                                                            <div className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{period.startTime}</div>
                                                            <div className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{period.endTime}</div>
                                                        </td>
                                                        {DAYS.slice(Math.floor(selectedDay / 3) * 3, Math.floor(selectedDay / 3) * 3 + 3).map((_, idx) => {
                                                            const actualDayIndex = Math.floor(selectedDay / 3) * 3 + idx;
                                                            const entry = getTimetableEntry(actualDayIndex, period.id);
                                                            const tempEntry = getTempAssignment(actualDayIndex, period.id);
                                                            const isPending = isPendingDeletion(actualDayIndex, period.id);
                                                            const cellKey = getCellKey(actualDayIndex, period.id);
                                                            const isSelected = selectedCells.has(cellKey);

                                                            return (
                                                                <td key={cellKey}
                                                                    className={`border p-1 transition-all ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} ${isEditing && period.periodNo !== 0 ? 'cursor-pointer' : period.periodNo === 0 ? 'cursor-not-allowed opacity-50' : ''} ${isSelected ? (isDarkMode ? 'bg-blue-900/50 border-blue-600' : 'bg-blue-50 border-blue-300') : ''}`}
                                                                    onClick={() => period.periodNo !== 0 && handleCellClick(actualDayIndex, period.id)}>
                                                                    {tempEntry ? (
                                                                        <div className="text-center min-h-[60px] flex flex-col items-center justify-center p-1 relative">
                                                                            <div className="font-bold text-green-600 text-xs break-words w-full">
                                                                                {searchType === 'teacher' ? `${getClassDisplay(tempEntry.classId!)}-${getSubjectCode(tempEntry.subjectId)}` : getSubjectCode(tempEntry.subjectId)}
                                                                            </div>
                                                                            <div className="text-[10px] text-green-700 mt-0.5 truncate w-full">
                                                                                {searchType === 'teacher' ? getClassDisplay(tempEntry.classId!) : getTeacherName(tempEntry.teacherId!)}
                                                                            </div>
                                                                            {isEditing && (
                                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteTemp(actualDayIndex, period.id); }}
                                                                                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full shadow-sm">
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ) : entry && !isPending ? (
                                                                        <div className="text-center min-h-[60px] flex flex-col items-center justify-center p-1 relative">
                                                                            <div className={`font-bold text-xs break-words w-full ${isDarkMode ? 'text-primary-400' : 'text-primary-700'}`}>
                                                                                {searchType === 'teacher' ? `${getClassDisplay(entry.classId)}-${getSubjectCode(entry.subjectId)}` : getSubjectCode(entry.subjectId)}
                                                                            </div>
                                                                            <div className={`text-[10px] mt-0.5 truncate w-full ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                                {searchType === 'teacher' ? getClassDisplay(entry.classId) : getTeacherName(entry.teacherId)}
                                                                            </div>
                                                                            {isEditing && entry.id && (
                                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id!, actualDayIndex, period.id); }}
                                                                                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full shadow-sm">
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ) : isPending ? (
                                                                        <div className="text-center min-h-[60px] flex flex-col items-center justify-center relative">
                                                                            <div className="text-[10px] text-red-500 font-medium">Del</div>
                                                                            <button onClick={(e) => { e.stopPropagation(); handleUndoDelete(actualDayIndex, period.id); }}
                                                                                className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 text-blue-600">
                                                                                <Check className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className={`text-center min-h-[60px] flex items-center justify-center text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                                                                            -
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop View - Table Grid */}
                            <div className="hidden md:block" id="printable-timetable">
                                {/* Print Header */}
                                <div className="hidden print:block mb-4">
                                    <h1 className="text-2xl font-bold text-center">Timetable</h1>
                                    <p className="text-center text-gray-600">
                                        {searchType === 'class' ? 'Class: ' : 'Teacher: '}{getSelectedName()}
                                    </p>
                                </div>

                                <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className={`border p-2 text-left font-semibold min-w-[90px] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-gray-200 text-gray-800'}`}>
                                                        <div className="text-xs">Period / Day</div>
                                                    </th>
                                                    {DAYS.map(day => (
                                                        <th key={day} className={`border p-2 text-center font-semibold min-w-[110px] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-gray-200 text-gray-800'}`}>
                                                            <div className="text-xs">{day}</div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {periods.map(period => (
                                                    <tr key={period.id}>
                                                        <td className={`border p-2 font-medium ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-gray-200 text-gray-800'}`}>
                                                            <div className="text-xs font-semibold">{period.periodNo === 0 ? 'RECESS' : `P${period.periodNo}`}</div>
                                                            <div className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{period.startTime}-{period.endTime}</div>
                                                        </td>
                                                        {DAYS.map((_day, dayIndex) => {
                                                            const entry = getTimetableEntry(dayIndex, period.id);
                                                            const tempEntry = getTempAssignment(dayIndex, period.id);
                                                            const isPending = isPendingDeletion(dayIndex, period.id);
                                                            const cellKey = getCellKey(dayIndex, period.id);
                                                            const isSelected = selectedCells.has(cellKey);
                                                            return (
                                                                <td key={cellKey}
                                                                    className={`border p-2 transition-all ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} ${isEditing && period.periodNo !== 0 ? 'cursor-pointer' : period.periodNo === 0 ? 'cursor-not-allowed opacity-50' : ''} ${isSelected ? (isDarkMode ? 'bg-blue-900 border-blue-600' : 'bg-blue-50 border-blue-300') : ''} ${!isSelected && isEditing && !entry && !tempEntry && period.periodNo !== 0 ? (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50') : ''}`}
                                                                    onClick={() => period.periodNo !== 0 && handleCellClick(dayIndex, period.id)}>
                                                                    {tempEntry ? (
                                                                        <div className="text-center relative group min-h-[50px] flex items-center justify-center">
                                                                            <div>
                                                                                <div className="font-medium text-green-600 text-xs">
                                                                                    {searchType === 'teacher' ? `${getClassDisplay(tempEntry.classId!)}-${getSubjectCode(tempEntry.subjectId)}` : getSubjectCode(tempEntry.subjectId)}
                                                                                </div>
                                                                                <div className="text-[10px] text-green-700 mt-0.5">
                                                                                    {searchType === 'teacher' ? getClassDisplay(tempEntry.classId!) : getTeacherName(tempEntry.teacherId!)}
                                                                                </div>
                                                                            </div>
                                                                            {isEditing && (
                                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteTemp(dayIndex, period.id); }}
                                                                                    className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 no-print">
                                                                                    <X className="w-2.5 h-2.5" />
                                                                                </button>
                                                                            )}
                                                                            <div className="absolute top-0.5 left-0.5 no-print">
                                                                                <Check className="w-2.5 h-2.5 text-green-600" />
                                                                            </div>
                                                                        </div>
                                                                    ) : entry && !isPending ? (
                                                                        <div className="text-center relative group min-h-[50px] flex items-center justify-center">
                                                                            <div>
                                                                                <div className="font-medium text-primary-600 text-xs">
                                                                                    {searchType === 'teacher' ? `${getClassDisplay(entry.classId)}-${getSubjectCode(entry.subjectId)}` : getSubjectCode(entry.subjectId)}
                                                                                </div>
                                                                                <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                                    {searchType === 'teacher' ? getClassDisplay(entry.classId) : getTeacherName(entry.teacherId)}
                                                                                </div>
                                                                            </div>
                                                                            {isEditing && entry.id && (
                                                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id!, dayIndex, period.id); }}
                                                                                    className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600 no-print">
                                                                                    <X className="w-2.5 h-2.5" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ) : isPending ? (
                                                                        <div className="text-center relative group min-h-[50px] flex items-center justify-center">
                                                                            <div className="text-xs text-red-600 font-medium">Deleted</div>
                                                                            <button onClick={(e) => { e.stopPropagation(); handleUndoDelete(dayIndex, period.id); }}
                                                                                className="absolute top-0.5 right-0.5 p-1 bg-blue-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-blue-600 no-print">
                                                                                <Check className="w-2.5 h-2.5" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className={`text-center min-h-[50px] flex items-center justify-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                            {isSelected ? <Check className="w-5 h-5 text-primary-600" /> : (isEditing ? 'Click to select' : '-')}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Floating Action Bar - Save/Cancel Buttons */}
                {isLocked && isEditing && (
                    <div className="fixed bottom-24 md:bottom-8 right-8 flex items-center gap-3 no-print z-50">
                        {/* Pending Changes Badge */}
                        {(tempAssignments.length > 0 || pendingDeletions.length > 0) && (
                            <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center font-bold text-lg ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                                {tempAssignments.length + pendingDeletions.length}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className={`flex items-center gap-2 rounded-lg shadow-2xl p-2 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <button
                                onClick={() => { setIsEditing(false); setTempAssignments([]); setPendingDeletions([]); setSelectedCells(new Set()); }}
                                className={`px-4 py-2 rounded-md transition-colors font-medium ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                            >
                                <X className="w-5 h-5 inline mr-1" />
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAll}
                                disabled={tempAssignments.length === 0 && pendingDeletions.length === 0}
                                className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg"
                            >
                                <Save className="w-5 h-5 inline mr-1" />
                                Save All
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Timetables;

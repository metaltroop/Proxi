import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Save, X, Plus, Edit, Check } from 'lucide-react';
import Autocomplete from '../components/Autocomplete';
import Dropdown from '../components/Dropdown';

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
        if (selectedId && isLocked) {
            checkAndFetchTimetable();
        }
    }, [selectedId, isLocked]);

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
            setPeriods(periodsRes.data.periods.filter((p: Period) => p.periodType === 'CLASS'));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAndFetchTimetable = async () => {
        setFetchingTimetable(true);
        try {
            const params = searchType === 'class' ? { classId: selectedId } : { teacherId: selectedId };
            const response = await api.get('/timetables', { params });
            const entries = response.data.timetable || [];
            setTimetable(entries);
            setTimetableExists(entries.length > 0);
            setIsEditing(false);
            setTempAssignments([]);
            setPendingDeletions([]);
            setSelectedCells(new Set());
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
            setTimetable([]);
            setTimetableExists(false);
        } finally {
            setFetchingTimetable(false);
        }
    };

    const handleSearch = () => {
        if (selectedId) setIsLocked(true);
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
        setTimetableExists(true);
    };

    const getCellKey = (day: number, periodId: string) => `${day}_${periodId}`;

    const getTimetableEntry = (day: number, periodId: string) =>
        timetable.find(t => t.dayOfWeek === day && t.periodId === periodId);

    const getTempAssignment = (day: number, periodId: string) =>
        tempAssignments.find(a => a.day === day && a.periodId === periodId);

    const isPendingDeletion = (day: number, periodId: string) =>
        pendingDeletions.some(d => d.day === day && d.periodId === periodId);

    const handleCellClick = (day: number, periodId: string) => {
        if (!isEditing) return;
        if (getTimetableEntry(day, periodId) || getTempAssignment(day, periodId)) return;
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
            const deletePromises = pendingDeletions.map(d => api.delete(`/timetables/${d.entryId}`));
            const createPromises = tempAssignments.map(assignment =>
                api.post('/timetables', {
                    classId: assignment.classId,
                    teacherId: assignment.teacherId,
                    subjectId: assignment.subjectId,
                    periodId: assignment.periodId,
                    dayOfWeek: assignment.day
                })
            );
            await Promise.all([...deletePromises, ...createPromises]);
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

    const subjectOptions = subjects.map(s => ({ value: s.id, label: `${s.subjectName} (${s.shortCode})` }));
    const classOptions = classes.map(c => ({ value: c.id, label: c.className }));
    const teacherOptions = teachers.map(t => ({ value: t.id, label: t.name }));

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-96 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Timetable Management</h1>
                <p className="text-gray-600 mt-1">Create and manage class timetables</p>
            </div>

            <div className="card mb-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Search by:</label>
                        <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button onClick={() => !isLocked && setSearchType('class')} disabled={isLocked}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${searchType === 'class' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'} ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}>
                                Class
                            </button>
                            <button onClick={() => !isLocked && setSearchType('teacher')} disabled={isLocked}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors ${searchType === 'teacher' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600'} ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}>
                                Teacher
                            </button>
                        </div>
                    </div>
                    <Autocomplete options={autocompleteOptions} value={selectedId} onChange={setSelectedId}
                        placeholder={`Search for a ${searchType}...`} locked={isLocked} onUnlock={handleUnlock} />
                    {!isLocked && selectedId && (
                        <button onClick={handleSearch} className="btn btn-primary w-full">
                            <Calendar className="w-5 h-5 mr-2 inline" />
                            Load Timetable
                        </button>
                    )}
                </div>
            </div>

            {isLocked && isEditing && (
                <div className="card mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Bulk Assignment</h2>
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
                        <p className="text-sm text-gray-600 mt-3">
                            Click cells in the grid to select/deselect them for bulk assignment
                        </p>
                    )}
                </div>
            )}

            {isLocked && fetchingTimetable && (
                <div className="card mb-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            )}

            {isLocked && !fetchingTimetable && (
                <div className="card mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {timetableExists ? 'Timetable' : 'No Timetable Found'}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {timetableExists
                                    ? (isEditing ? `${tempAssignments.length + pendingDeletions.length} pending changes` : 'View-only mode')
                                    : (searchType === 'teacher' ? 'Create a new timetable to get started' : 'No timetable found')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {timetableExists && !isEditing && (
                                <button onClick={() => setIsEditing(true)} className="btn btn-primary flex items-center gap-2">
                                    <Edit className="w-5 h-5" />
                                    Edit Timetable
                                </button>
                            )}
                            {isEditing && (tempAssignments.length > 0 || pendingDeletions.length > 0) && (
                                <button onClick={handleSaveAll} className="btn btn-primary flex items-center gap-2">
                                    <Save className="w-5 h-5" />
                                    Save All ({tempAssignments.length + pendingDeletions.length})
                                </button>
                            )}
                            {isEditing && (
                                <button onClick={() => { setIsEditing(false); setTempAssignments([]); setPendingDeletions([]); setSelectedCells(new Set()); }} className="btn btn-secondary">
                                    Cancel
                                </button>
                            )}
                            {!timetableExists && searchType === 'teacher' && (
                                <button onClick={handleCreateTimetable} className="btn btn-primary flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Create Timetable
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isLocked && fetchingTimetable && (
                <div className="card overflow-x-auto">
                    <div className="animate-pulse space-y-3">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-gray-100 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isLocked && !fetchingTimetable && timetableExists && (
                <div className="card overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border border-gray-200 p-2 bg-gradient-to-br from-indigo-50 to-blue-50 text-left font-semibold text-gray-800 min-w-[90px] rounded-tl-lg">
                                    <div className="text-xs">Period / Day</div>
                                </th>
                                {DAYS.map((day, idx) => (
                                    <th key={day} className={`border border-gray-200 p-2 bg-gradient-to-br from-indigo-50 to-blue-50 text-center font-semibold text-gray-800 min-w-[110px] ${idx === DAYS.length - 1 ? 'rounded-tr-lg' : ''}`}>
                                        <div className="text-xs">{day}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map((period, pIdx) => (
                                <tr key={period.id}>
                                    <td className={`border border-gray-200 p-2 bg-gradient-to-r from-purple-50 to-pink-50 font-medium text-gray-800 ${pIdx === periods.length - 1 ? 'rounded-bl-lg' : ''}`}>
                                        <div className="text-xs font-semibold">P{period.periodNo}</div>
                                        <div className="text-[10px] text-gray-600">{period.startTime}-{period.endTime}</div>
                                    </td>
                                    {DAYS.map((day, dayIndex) => {
                                        const entry = getTimetableEntry(dayIndex, period.id);
                                        const tempEntry = getTempAssignment(dayIndex, period.id);
                                        const isPending = isPendingDeletion(dayIndex, period.id);
                                        const cellKey = getCellKey(dayIndex, period.id);
                                        const isSelected = selectedCells.has(cellKey);
                                        return (
                                            <td key={cellKey}
                                                className={`border border-gray-200 p-2 transition-all ${pIdx === periods.length - 1 && dayIndex === DAYS.length - 1 ? 'rounded-br-lg' : ''} ${isEditing ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50 border-blue-300' : ''} ${!isSelected && isEditing && !entry && !tempEntry ? 'hover:bg-gray-50' : ''}`}
                                                onClick={() => handleCellClick(dayIndex, period.id)}>
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
                                                                className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600">
                                                                <X className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                        <div className="absolute top-0.5 left-0.5">
                                                            <Check className="w-2.5 h-2.5 text-green-600" />
                                                        </div>
                                                    </div>
                                                ) : entry && !isPending ? (
                                                    <div className="text-center relative group min-h-[50px] flex items-center justify-center">
                                                        <div>
                                                            <div className="font-medium text-primary-600 text-xs">
                                                                {searchType === 'teacher' ? `${getClassDisplay(entry.classId)}-${getSubjectCode(entry.subjectId)}` : getSubjectCode(entry.subjectId)}
                                                            </div>
                                                            <div className="text-[10px] text-gray-600 mt-0.5">
                                                                {searchType === 'teacher' ? getClassDisplay(entry.classId) : getTeacherName(entry.teacherId)}
                                                            </div>
                                                        </div>
                                                        {isEditing && entry.id && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id!, dayIndex, period.id); }}
                                                                className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600">
                                                                <X className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : isPending && entry ? (
                                                    <div className="text-center relative group min-h-[50px] flex items-center justify-center">
                                                        <div className="opacity-50 line-through">
                                                            <div className="font-medium text-red-600 text-xs">
                                                                {searchType === 'teacher' ? `${getClassDisplay(entry.classId)}-${getSubjectCode(entry.subjectId)}` : getSubjectCode(entry.subjectId)}
                                                            </div>
                                                            <div className="text-[10px] text-red-700 mt-0.5">
                                                                {searchType === 'teacher' ? getClassDisplay(entry.classId) : getTeacherName(entry.teacherId)}
                                                            </div>
                                                        </div>
                                                        {isEditing && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleUndoDelete(dayIndex, period.id); }}
                                                                className="absolute top-0.5 right-0.5 p-1 bg-gray-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-gray-600"
                                                                title="Undo delete">
                                                                <X className="w-2.5 h-2.5" />
                                                            </button>
                                                        )}
                                                        <div className="absolute top-0.5 left-0.5">
                                                            <X className="w-2.5 h-2.5 text-red-600" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-gray-400 text-xs min-h-[50px] flex items-center justify-center">
                                                        {isEditing && isSelected && <Check className="w-3 h-3 mx-auto text-blue-600" />}
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
            )}
        </div>
    );
};

export default Timetables;

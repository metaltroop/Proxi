import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, Save, X, Check, LayoutGrid, Table as TableIcon, Trash2 } from 'lucide-react';
import Autocomplete from '../components/Autocomplete';

interface Teacher {
    id: string;
    name: string;
    employeeId: string | null;
    phone?: string;
}

interface ScheduleEntry {
    periodId: string;
    periodNo: number;
    startTime: string;
    endTime: string;
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
}

interface AvailableTeacher {
    id: string;
    name: string;
    employeeId: string | null;
    currentLoad: number;
}

interface TempProxyAssignment {
    periodId: string;
    proxyTeacherId: string;
    classId: string;
    subjectId: string;
    remarks?: string;
}

interface ExistingProxy {
    id: string;
    periodId: string;
    assignedTeacherId: string;
    assignedTeacher: {
        name: string;
    };
    notes?: string;
}

type TeacherStatus = 'ABSENT' | 'BUSY' | 'HALF_DAY' | null;
type ViewMode = 'grid' | 'table';

const Proxies: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [fetchingSchedule, setFetchingSchedule] = useState(false);

    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [isLocked, setIsLocked] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Auto-detect today's date
    const currentDate = new Date().toISOString().split('T')[0];
    const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const [teacherSchedule, setTeacherSchedule] = useState<ScheduleEntry[]>([]);
    const [teacherStatus, setTeacherStatus] = useState<TeacherStatus>(null);

    const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
    const [tempAssignments, setTempAssignments] = useState<TempProxyAssignment[]>([]);
    const [existingAssignments, setExistingAssignments] = useState<ExistingProxy[]>([]);
    const [availableTeachersMap, setAvailableTeachersMap] = useState<Record<string, AvailableTeacher[]>>({});
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [loadingPeriods, setLoadingPeriods] = useState<Set<string>>(new Set());

    const handleLoadSchedule = async () => {
        if (!selectedTeacherId) return;

        setFetchingSchedule(true);
        try {
            const response = await api.get('/proxy/teacher-schedule', {
                params: {
                    teacherId: selectedTeacherId,
                    date: currentDate
                }
            });

            setTeacherSchedule(response.data.schedule);
            setExistingAssignments(response.data.existingProxies || []);
            setIsLocked(true);
            setTeacherStatus(null);
            setSelectedCells(new Set());
            setTempAssignments([]);
            setAvailableTeachersMap({});
        } catch (error) {
            console.error('Failed to fetch teacher schedule:', error);
            alert('Failed to load teacher schedule');
        } finally {
            setFetchingSchedule(false);
        }
    };

    const handleUnlock = () => {
        setIsLocked(false);
        setSelectedTeacherId('');
        setTeacherSchedule([]);
        setTeacherStatus(null);
        setSelectedCells(new Set());
        setTempAssignments([]);
        setExistingAssignments([]);
        setAvailableTeachersMap({});
        setTeachers([]);
    };

    const handleStatusSelect = (status: TeacherStatus) => {
        setTeacherStatus(status);
        setSelectedCells(new Set());
        setTempAssignments([]);
        setAvailableTeachersMap({});
    };

    const handleCellClick = (periodId: string) => {
        if (!teacherStatus) return;

        // Don't allow selecting if there's an existing proxy (must delete first)
        if (existingAssignments.some(p => p.periodId === periodId)) {
            alert('Please delete the existing proxy assignment before creating a new one.');
            return;
        }

        const newSelected = new Set(selectedCells);
        if (newSelected.has(periodId)) {
            newSelected.delete(periodId);
        } else {
            newSelected.add(periodId);
        }
        setSelectedCells(newSelected);
    };

    const fetchAvailableTeachers = async (periodId: string) => {
        setLoadingPeriods(prev => {
            const next = new Set(prev);
            next.add(periodId);
            return next;
        });
        try {
            const response = await api.get('/proxy/available-teachers', {
                params: {
                    date: currentDate,
                    periodId,
                    excludeTeacherId: selectedTeacherId
                }
            });

            setAvailableTeachersMap(prev => ({
                ...prev,
                [periodId]: response.data.availableTeachers
            }));
        } catch (error) {
            console.error('Failed to fetch available teachers:', error);
        } finally {
            setLoadingPeriods(prev => {
                const next = new Set(prev);
                next.delete(periodId);
                return next;
            });
        }
    };

    useEffect(() => {
        // Fetch available teachers for selected cells
        selectedCells.forEach(periodId => {
            if (!availableTeachersMap[periodId]) {
                fetchAvailableTeachers(periodId);
            }
        });
    }, [selectedCells]);

    const handleProxySelect = (periodId: string, proxyTeacherId: string) => {
        const scheduleEntry = teacherSchedule.find(s => s.periodId === periodId);
        if (!scheduleEntry) return;

        const newAssignment: TempProxyAssignment = {
            periodId,
            proxyTeacherId,
            classId: scheduleEntry.classId,
            subjectId: scheduleEntry.subjectId
        };

        setTempAssignments(prev => {
            const filtered = prev.filter(a => a.periodId !== periodId);
            return [...filtered, newAssignment];
        });
    };

    const handleRemoveTemp = (periodId: string) => {
        setTempAssignments(prev => prev.filter(a => a.periodId !== periodId));
    };

    const handleDeleteExisting = async (proxyId: string) => {
        if (!window.confirm('Are you sure you want to delete this proxy assignment?')) return;

        setDeletingId(proxyId);
        try {
            await api.delete(`/proxy/assignments/${proxyId}`);
            setExistingAssignments(prev => prev.filter(p => p.id !== proxyId));
        } catch (error) {
            console.error('Failed to delete proxy:', error);
            alert('Failed to delete proxy assignment');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSaveAll = async () => {
        if (tempAssignments.length === 0) {
            alert('No proxy assignments to save');
            return;
        }

        if (!teacherStatus) {
            alert('Please select a teacher status');
            return;
        }

        setSaving(true);
        try {
            await api.post('/proxy/assignments/bulk', {
                date: currentDate,
                absentTeacherId: selectedTeacherId,
                status: teacherStatus,
                assignments: tempAssignments,
                createdBy: 'admin' // TODO: Get from auth context
            });

            alert('Proxy assignments saved successfully!');
            // Reload schedule to refresh existing assignments
            handleLoadSchedule();
        } catch (error: any) {
            console.error('Save error:', error);
            alert(error.response?.data?.error || 'Failed to save proxy assignments');
        } finally {
            setSaving(false);
        }
    };

    const getTempAssignment = (periodId: string) =>
        tempAssignments.find(a => a.periodId === periodId);

    const getExistingAssignment = (periodId: string) =>
        existingAssignments.find(a => a.periodId === periodId);

    const getProxyTeacherName = (teacherId: string) => {
        // Fetch all teachers to find the name
        const allTeachers = [...teachers];
        // Also check in available teachers map
        Object.values(availableTeachersMap).forEach(teacherList => {
            allTeachers.push(...teacherList);
        });
        return allTeachers.find(t => t.id === teacherId)?.name || '';
    };

    // Fetch teachers when user searches
    const handleTeacherSearch = async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 2) {
            setTeachers([]);
            return;
        }

        try {
            const response = await api.get('/teachers');
            const allTeachers = response.data.teachers;

            // Filter teachers based on search query
            const filtered = allTeachers.filter((teacher: Teacher) =>
                teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.phone?.includes(searchQuery)
            );

            setTeachers(filtered);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

    const autocompleteOptions = teachers.map(teacher => ({
        id: teacher.id,
        label: teacher.name,
        sublabel: teacher.employeeId ? `ID: ${teacher.employeeId}` : (teacher.phone || '')
    }));

    return (
        <div className="p-8">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Proxy Assignment</h1>
                    <p className="text-gray-600 mt-1">Assign substitute teachers for absent staff</p>
                </div>
                {isLocked && (
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Table View"
                        >
                            <TableIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Teacher Search */}
            <div className="card mb-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Today:</label>
                        <div className="text-lg font-semibold text-primary-600">
                            {currentDayName}, {new Date(currentDate).toLocaleDateString()}
                        </div>
                    </div>

                    <Autocomplete
                        options={autocompleteOptions}
                        value={selectedTeacherId}
                        onChange={setSelectedTeacherId}
                        onSearch={handleTeacherSearch}
                        placeholder="Search for a teacher..."
                        locked={isLocked}
                        onUnlock={handleUnlock}
                    />

                    {!isLocked && selectedTeacherId && (
                        <button
                            onClick={handleLoadSchedule}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                            disabled={fetchingSchedule}
                        >
                            <Calendar className={`w-5 h-5 ${fetchingSchedule ? 'animate-spin' : ''}`} />
                            {fetchingSchedule ? 'Loading Schedule...' : 'Load Schedule'}
                        </button>
                    )}
                </div>
            </div>

            {/* Teacher Status Selection */}
            {isLocked && !fetchingSchedule && teacherSchedule.length > 0 && (
                <div className="card mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Teacher Status</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleStatusSelect('ABSENT')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${teacherStatus === 'ABSENT'
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🔴 Mark as Absent
                        </button>
                        <button
                            onClick={() => handleStatusSelect('BUSY')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${teacherStatus === 'BUSY'
                                ? 'bg-yellow-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🟡 Mark as Busy (School Work)
                        </button>
                        <button
                            onClick={() => handleStatusSelect('HALF_DAY')}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${teacherStatus === 'HALF_DAY'
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🟠 Mark as Half Day
                        </button>
                    </div>
                    {teacherStatus && (
                        <p className="text-sm text-gray-600 mt-3">
                            Click on periods below to select them for proxy assignment
                        </p>
                    )}
                </div>
            )}

            {/* Loading State */}
            {isLocked && fetchingSchedule && (
                <div className="card">
                    <div className="animate-pulse space-y-3">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-24 bg-gray-100 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Teacher Schedule Grid/Table */}
            {isLocked && !fetchingSchedule && teacherSchedule.length > 0 && (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                            {teacherSchedule.map(entry => {
                                const isSelected = selectedCells.has(entry.periodId);
                                const tempAssignment = getTempAssignment(entry.periodId);
                                const existingAssignment = getExistingAssignment(entry.periodId);
                                const availableTeachers = availableTeachersMap[entry.periodId] || [];

                                const isLoading = loadingPeriods.has(entry.periodId);

                                return (
                                    <div
                                        key={entry.periodId}
                                        className={`card transition-all 
                                            ${isLoading ? 'ring-2 ring-blue-500 animate-pulse bg-blue-50' : ''}
                                            ${!isLoading && isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                                            ${tempAssignment ? 'ring-2 ring-green-500 bg-green-50' : ''} 
                                            ${existingAssignment ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
                                            ${teacherStatus ? 'cursor-pointer hover:shadow-lg' : ''
                                            }`}
                                        onClick={() => teacherStatus && !isLoading && handleCellClick(entry.periodId)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-800">
                                                    Period {entry.periodNo}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {entry.startTime} - {entry.endTime}
                                                </div>
                                            </div>

                                            {/* Status Icons */}
                                            {isSelected && !tempAssignment && !existingAssignment && (
                                                <Check className="w-5 h-5 text-blue-600" />
                                            )}
                                            {tempAssignment && (
                                                <div className="flex items-center gap-2">
                                                    <Check className="w-5 h-5 text-green-600" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveTemp(entry.periodId);
                                                        }}
                                                        className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                            {existingAssignment && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">ASSIGNED</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteExisting(existingAssignment.id);
                                                        }}
                                                        className="p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                                        title="Delete Proxy"
                                                        disabled={deletingId === existingAssignment.id}
                                                    >
                                                        <Trash2 className={`w-3 h-3 ${deletingId === existingAssignment.id ? 'animate-spin' : ''}`} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1 mb-3">
                                            <div className="text-sm font-medium text-gray-900">{entry.className}</div>
                                            <div className="text-xs text-gray-600">
                                                {entry.subjectName} ({entry.subjectCode})
                                            </div>
                                        </div>

                                        {isSelected && !tempAssignment && !existingAssignment && availableTeachers.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <label className="text-xs font-medium text-gray-700 block mb-2">
                                                    Assign Proxy Teacher:
                                                </label>
                                                <select
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => handleProxySelect(entry.periodId, e.target.value)}
                                                    className="w-full px-4 py-2.5 text-sm bg-white border-2 border-primary-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all hover:border-primary-400 cursor-pointer"
                                                >
                                                    <option value="" className="text-gray-500">Select teacher...</option>
                                                    {availableTeachers.map(teacher => (
                                                        <option key={teacher.id} value={teacher.id} className="text-gray-900 py-2">
                                                            {teacher.name} ({teacher.currentLoad} classes)
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {tempAssignment && (
                                            <div className="mt-3 pt-3 border-t border-green-200">
                                                <div className="text-xs font-medium text-green-700">
                                                    Proxy: {getProxyTeacherName(tempAssignment.proxyTeacherId)}
                                                </div>
                                            </div>
                                        )}

                                        {existingAssignment && (
                                            <div className="mt-3 pt-3 border-t border-purple-200">
                                                <div className="text-xs font-medium text-purple-700">
                                                    Proxy: {existingAssignment.assignedTeacher.name}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="card overflow-hidden mb-6">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="p-4 font-semibold text-gray-700">Period</th>
                                        <th className="p-4 font-semibold text-gray-700">Time</th>
                                        <th className="p-4 font-semibold text-gray-700">Class</th>
                                        <th className="p-4 font-semibold text-gray-700">Subject</th>
                                        <th className="p-4 font-semibold text-gray-700">Proxy Status</th>
                                        <th className="p-4 font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teacherSchedule.map(entry => {
                                        const isSelected = selectedCells.has(entry.periodId);
                                        const tempAssignment = getTempAssignment(entry.periodId);
                                        const existingAssignment = getExistingAssignment(entry.periodId);
                                        const availableTeachers = availableTeachersMap[entry.periodId] || [];

                                        return (
                                            <tr key={entry.periodId} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{entry.periodNo}</td>
                                                <td className="p-4 text-gray-600">{entry.startTime} - {entry.endTime}</td>
                                                <td className="p-4 text-gray-900">{entry.className}</td>
                                                <td className="p-4 text-gray-600">{entry.subjectName}</td>
                                                <td className="p-4">
                                                    {existingAssignment ? (
                                                        <span className="text-purple-600 font-medium">
                                                            {existingAssignment.assignedTeacher.name}
                                                        </span>
                                                    ) : tempAssignment ? (
                                                        <span className="text-green-600 font-medium">
                                                            {getProxyTeacherName(tempAssignment.proxyTeacherId)} (Pending)
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {existingAssignment ? (
                                                        <button
                                                            onClick={() => handleDeleteExisting(existingAssignment.id)}
                                                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                                                            title="Delete Proxy"
                                                            disabled={deletingId === existingAssignment.id}
                                                        >
                                                            <Trash2 className={`w-4 h-4 ${deletingId === existingAssignment.id ? 'animate-spin' : ''}`} />
                                                        </button>
                                                    ) : tempAssignment ? (
                                                        <button
                                                            onClick={() => handleRemoveTemp(entry.periodId)}
                                                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        teacherStatus && (
                                                            isSelected ? (
                                                                <div className="w-64">
                                                                    <select
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onChange={(e) => handleProxySelect(entry.periodId, e.target.value)}
                                                                        className="w-full px-3 py-2 text-sm bg-white border-2 border-primary-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all hover:border-primary-400"
                                                                    >
                                                                        <option value="" className="text-gray-500">Select teacher...</option>
                                                                        {availableTeachers.map(teacher => (
                                                                            <option key={teacher.id} value={teacher.id} className="text-gray-900">
                                                                                {teacher.name} ({teacher.currentLoad})
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleCellClick(entry.periodId)}
                                                                    className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                                                                >
                                                                    Assign Proxy
                                                                </button>
                                                            )
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Save Button */}
            {isLocked && tempAssignments.length > 0 && (
                <div className="card sticky bottom-6 shadow-2xl border-t-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Pending Proxy Assignments</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {tempAssignments.length} assignment{tempAssignments.length !== 1 ? 's' : ''} ready to save
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setTempAssignments([]);
                                    setSelectedCells(new Set());
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button onClick={handleSaveAll} className="btn btn-primary flex items-center gap-2" disabled={saving}>
                                <Save className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
                                {saving ? 'Saving...' : `Save All (${tempAssignments.length})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* No Schedule Message */}
            {isLocked && !fetchingSchedule && teacherSchedule.length === 0 && (
                <div className="card text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedule Found</h3>
                    <p className="text-gray-600">
                        This teacher has no classes scheduled for {currentDayName}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Proxies;

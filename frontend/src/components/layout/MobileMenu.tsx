import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, BookOpen, Calendar, Grid3x3, FileText, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const handleNavigation = (path: string) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-3xl shadow-2xl overflow-y-auto transition-transform duration-300 ease-out pb-safe ${isOpen ? 'translate-y-0' : 'translate-y-full'} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
                style={{ maxHeight: 'calc(85vh + env(safe-area-inset-bottom, 20px))' }}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>More</h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Profile Section */}
                <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-600'}`}>
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'User'}</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email || 'user@example.com'}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="p-4">
                    <div className="space-y-2">
                        <button
                            onClick={() => handleNavigation('/classes')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${isDarkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-50 text-gray-900'}`}
                        >
                            <Grid3x3 className="w-6 h-6" />
                            <span className="text-lg font-medium">Classes</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/subjects')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${isDarkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-50 text-gray-900'}`}
                        >
                            <BookOpen className="w-6 h-6" />
                            <span className="text-lg font-medium">Subjects</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/periods')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${isDarkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-50 text-gray-900'}`}
                        >
                            <Calendar className="w-6 h-6" />
                            <span className="text-lg font-medium">Periods</span>
                        </button>

                        <button
                            onClick={() => handleNavigation('/reports')}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${isDarkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-50 text-gray-900'}`}
                        >
                            <FileText className="w-6 h-6" />
                            <span className="text-lg font-medium">Reports</span>
                        </button>
                    </div>
                </div>

                {/* Settings Section */}
                <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className="space-y-2">
                        <button
                            onClick={toggleTheme}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${isDarkMode ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-50 text-gray-900'}`}
                        >
                            <div className="flex items-center gap-4">
                                {isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                                <span className="text-lg font-medium">Dark Mode</span>
                            </div>
                            <div className={`w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-primary-600' : 'bg-gray-300'} relative`}>
                                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </div>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="w-6 h-6" />
                            <span className="text-lg font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileMenu;

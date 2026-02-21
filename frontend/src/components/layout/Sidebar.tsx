import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    LayoutDashboard,
    Users,
    School,
    BookOpen,
    Clock,
    Calendar,
    UserPlus,
    FileText,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun
} from 'lucide-react';
import logo from '../../assets/logo.png';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/teachers', label: 'Teachers', icon: Users },
        { path: '/classes', label: 'Classes', icon: School },
        { path: '/subjects', label: 'Subjects', icon: BookOpen },
        { path: '/periods', label: 'Period Structure', icon: Clock },
        { path: '/timetables', label: 'Timetables', icon: Calendar },
        { path: '/proxies', label: 'Proxies', icon: UserPlus },
        { path: '/reports', label: 'Reports', icon: FileText },
    ];

    return (
        <div
            className={`
                ${isCollapsed ? 'w-20' : 'w-64'} 
                ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
                border-r flex flex-col transition-all duration-300 ease-in-out h-full relative
            `}
        >
            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`
                    absolute -right-3 top-9 bg-primary-600 text-white rounded-full p-1 shadow-md hover:bg-primary-700 transition-colors z-10
                    ${isDarkMode ? 'border border-gray-700' : ''}
                `}
            >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Logo */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center overflow-hidden`}>
                {isCollapsed ? (
                    <img src={logo} alt="Proxi Logo" className={`w-12 h-12 object-contain ${!isDarkMode ? 'brightness-0' : ''}`} />
                ) : (
                    <div className="flex items-center gap-3 min-w-max">
                        <img src={logo} alt="Proxi Logo" className={`w-16 h-16 object-contain ${!isDarkMode ? 'brightness-0' : ''}`} />
                        <div>
                            <h1 className="text-2xl font-bold text-primary-600">Proxi</h1>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>School Management</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        title={isCollapsed ? item.label : ''}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${isActive
                                ? 'bg-primary-50 text-primary-700 font-medium'
                                : `${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-50'}`
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} space-y-4`}>

                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`
                        w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                        ${isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                    title={isCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : ''}
                >
                    {isDarkMode ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
                    <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </button>

                {/* User Profile */}
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-semibold">
                            {user?.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{user?.name}</p>
                            <p className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{user?.role}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? 'Logout' : ''}
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    School,
    BookOpen,
    Clock,
    Calendar,
    UserPlus,
    FileText
} from 'lucide-react';

const BottomNav: React.FC = () => {
    const menuItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/teachers', label: 'Teachers', icon: Users },
        { path: '/classes', label: 'Classes', icon: School },
        { path: '/timetables', label: 'Time', icon: Calendar },
        { path: '/proxies', label: 'Proxies', icon: UserPlus },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden z-50 safe-area-bottom">
            <nav className="flex justify-between items-center max-w-md mx-auto">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isActive
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default BottomNav;

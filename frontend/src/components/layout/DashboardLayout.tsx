import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

import { useTheme } from '../../context/ThemeContext';

const DashboardLayout: React.FC = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`flex h-screen print:h-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50 print:bg-white'}`}>
            {/* Sidebar - Hidden on mobile */}
            <div className="h-full flex-none hidden md:flex print:hidden">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto print:overflow-visible print:w-full print:h-auto pb-20 md:pb-0">
                <Outlet />
            </main>

            {/* Bottom Navigation - Visible only on mobile */}
            <BottomNav />
        </div>
    );
};

export default DashboardLayout;

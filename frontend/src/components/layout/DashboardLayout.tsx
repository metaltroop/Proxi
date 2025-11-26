import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-50 print:bg-white print:h-auto">
            <div className="h-full flex-none print:hidden">
                <Sidebar />
            </div>
            <main className="flex-1 overflow-y-auto print:overflow-visible print:w-full print:h-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;

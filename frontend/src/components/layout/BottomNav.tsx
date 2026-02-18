import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    UserPlus,
    MoreHorizontal
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import MobileMenu from './MobileMenu';

import { Keyboard } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { haptics } from '../../utils/haptics';

const BottomNav: React.FC = () => {
    const { isDarkMode } = useTheme();
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    React.useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            Keyboard.addListener('keyboardWillShow', () => setIsKeyboardOpen(true));
            Keyboard.addListener('keyboardWillHide', () => setIsKeyboardOpen(false));

            return () => {
                Keyboard.removeAllListeners();
            };
        }
    }, []);

    const menuItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/teachers', label: 'Teachers', icon: Users },
        { path: '/timetables', label: 'Timetables', icon: Calendar },
        { path: '/proxies', label: 'Proxies', icon: UserPlus },
    ];

    if (isKeyboardOpen) return null;

    return (
        <>
            <div className={`fixed bottom-0 left-0 right-0 border-t px-4 py-2 md:hidden z-50 safe-area-bottom transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <nav className="flex justify-between items-center max-w-md mx-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={() => haptics.light()}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isActive
                                    ? 'text-primary-600'
                                    : (isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                                }`
                            }
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </NavLink>
                    ))}

                    {/* More Button */}
                    <button
                        onClick={() => {
                            setShowMobileMenu(true);
                            haptics.light();
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <MoreHorizontal className="w-6 h-6" />
                        <span className="text-[10px] font-medium">More</span>
                    </button>
                </nav>
            </div>

            <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
        </>
    );
};

export default BottomNav;

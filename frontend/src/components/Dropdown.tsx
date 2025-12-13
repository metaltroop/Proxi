import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DropdownOption {
    id: string;
    label: string;
    sublabel?: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select...'
}) => {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionId: string) => {
        onChange(optionId);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div
                className={`flex items-center justify-between w-full px-4 py-3 border-2 rounded-xl cursor-pointer transition-all
                ${isOpen
                        ? 'border-primary-500 ring-2 ring-primary-500'
                        : (isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-primary-400')}
                ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-whit e text-gray-900'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`flex-1 ${!selectedOption ? (isDarkMode ? 'text-gray-500' : 'text-gray-400') : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </div>
                <div className="flex items-center gap-2">
                    {selectedOption && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            title="Clear selection"
                        >
                            <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`} />
                        </button>
                    )}
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
            </div>

            {isOpen && (
                <div className={`absolute z-[100] w-full mt-2 border-2 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 origin-top
                    ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className={`w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 first:rounded-t-xl last:rounded-b-xl
                                ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}
                                ${option.id === value
                                    ? (isDarkMode ? 'bg-primary-900/30 text-primary-300' : 'bg-primary-50 text-primary-900')
                                    : (isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-primary-50 text-gray-900')}`}
                        >
                            <div className="font-medium">{option.label}</div>
                            {option.sublabel && (
                                <div className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{option.sublabel}</div>
                            )}
                        </button>
                    ))}
                    {options.length === 0 && (
                        <div className={`px-4 py-3 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dropdown;

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AutocompleteOption {
    id: string;
    label: string;
    sublabel?: string;
}

interface AutocompleteProps {
    options: AutocompleteOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    locked?: boolean;
    onUnlock?: () => void;
    onSearch?: (query: string) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Search...',
    locked = false,
    onUnlock,
    onSearch
}) => {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.sublabel?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (optionId: string) => {
        onChange(optionId);
        setSearchQuery('');
        setIsOpen(false);
    };

    const handleUnlock = () => {
        if (onUnlock) {
            onUnlock();
            setSearchQuery('');
        }
    };

    // Locked state - blue background
    if (locked && selectedOption) {
        return (
            <div className="relative">
                <div className={`flex items-center gap-2 border-2 rounded-xl px-4 py-3 ${isDarkMode ? 'bg-primary-900/20 border-primary-500' : 'bg-primary-50 border-primary-500'}`}>
                    <div className="flex-1">
                        <div className={`font-semibold ${isDarkMode ? 'text-primary-300' : 'text-primary-900'}`}>{selectedOption.label}</div>
                        {selectedOption.sublabel && (
                            <div className={`text-sm ${isDarkMode ? 'text-primary-400' : 'text-primary-700'}`}>{selectedOption.sublabel}</div>
                        )}
                    </div>
                    {onUnlock && (
                        <button
                            onClick={handleUnlock}
                            className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-primary-900/40' : 'hover:bg-primary-100'}`}
                            title="Change selection"
                        >
                            <X className={`w-5 h-5 ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Selected but not locked - gray background, clickable to reopen
    if (!locked && selectedOption && !isOpen) {
        return (
            <div ref={wrapperRef} className="relative">
                <div
                    className={`flex items-center gap-2 border-2 rounded-xl px-4 py-3 cursor-pointer transition-colors
                        ${isDarkMode
                            ? 'bg-gray-800 border-gray-600 hover:border-gray-500'
                            : 'bg-gray-50 border-gray-300 hover:border-primary-400'}`}
                    onClick={() => setIsOpen(true)}
                >
                    <div className="flex-1">
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedOption.label}</div>
                        {selectedOption.sublabel && (
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedOption.sublabel}</div>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                        }}
                        className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    >
                        <X className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="relative">
            <div
                className={`flex items-center gap-2 w-full px-4 py-3 border-2 rounded-xl transition-all
                    ${isOpen
                        ? 'border-primary-500 ring-2 ring-primary-500'
                        : (isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-primary-400')}
                    ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                onClick={() => !isOpen && setIsOpen(true)}
            >
                <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                    type="text"
                    className={`flex-1 bg-transparent border-none outline-none placeholder-gray-400 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (onSearch) onSearch(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && (
                <div className={`absolute z-50 w-full mt-2 border-2 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 origin-top
                    ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                className={`w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 first:rounded-t-xl last:rounded-b-xl
                                    ${isDarkMode ? 'border-gray-700 hover:bg-gray-700 text-gray-200' : 'border-gray-100 hover:bg-primary-50 text-gray-900'}`}
                            >
                                <div className="font-medium">{option.label}</div>
                                {option.sublabel && (
                                    <div className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{option.sublabel}</div>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className={`px-4 py-3 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            No results found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Autocomplete;

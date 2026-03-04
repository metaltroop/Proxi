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
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

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

    // Reset highlight when search changes
    useEffect(() => {
        setHighlightedIndex(0);
    }, [searchQuery]);

    // Scroll into view when highlighting with keyboard
    useEffect(() => {
        if (isOpen && listRef.current) {
            const listElement = listRef.current;
            const highlightedElement = listElement.children[highlightedIndex] as HTMLElement;

            if (highlightedElement) {
                const elementTop = highlightedElement.offsetTop;
                const elementBottom = elementTop + highlightedElement.offsetHeight;
                const scrollVisibleTop = listElement.scrollTop;
                const scrollVisibleBottom = scrollVisibleTop + listElement.clientHeight;

                if (elementTop < scrollVisibleTop) {
                    listElement.scrollTop = elementTop;
                } else if (elementBottom > scrollVisibleBottom) {
                    listElement.scrollTop = elementBottom - listElement.clientHeight;
                }
            }
        }
    }, [highlightedIndex, isOpen]);

    const handleSelect = (optionId: string) => {
        onChange(optionId);
        setSearchQuery('');
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => Math.min(filteredOptions.length - 1, prev + 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(0, prev - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex].id);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
        }
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
                <div className={`flex items-center gap-3 border rounded-lg px-3 py-1.5 ${isDarkMode ? 'bg-primary-900/10 border-primary-500/50' : 'bg-primary-50/50 border-primary-400'}`}>
                    <div className="flex-1 flex items-baseline gap-2 overflow-hidden whitespace-nowrap">
                        <span className={`font-semibold truncate ${isDarkMode ? 'text-primary-300' : 'text-primary-800'}`}>{selectedOption.label}</span>
                        {selectedOption.sublabel && (
                            <span className={`text-xs truncate ${isDarkMode ? 'text-primary-400/80' : 'text-primary-600/80'}`}>({selectedOption.sublabel})</span>
                        )}
                    </div>
                    {onUnlock && (
                        <button
                            onClick={handleUnlock}
                            className={`p-1 -mr-1 rounded-md transition-colors flex-shrink-0 ${isDarkMode ? 'hover:bg-primary-900/40' : 'hover:bg-primary-200/50'}`}
                            title="Change selection"
                        >
                            <X className={`w-4 h-4 ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`} />
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
                    className={`flex items-center justify-between border-2 rounded-xl px-4 py-2 cursor-pointer transition-colors
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
                    onKeyDown={handleKeyDown}
                />
            </div>

            {isOpen && (
                <div
                    ref={listRef}
                    className={`absolute z-50 w-full mt-2 border-2 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 origin-top
                    ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 first:rounded-t-xl last:rounded-b-xl
                                ${isDarkMode ? 'border-gray-700 text-gray-200' : 'border-gray-100 text-gray-900'}
                                ${highlightedIndex === index ? (isDarkMode ? 'bg-gray-700' : 'bg-primary-50') : ''}`}
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

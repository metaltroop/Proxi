import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

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
}

const Autocomplete: React.FC<AutocompleteProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Search...',
    locked = false,
    onUnlock
}) => {
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
                <div className="flex items-center gap-2 bg-primary-50 border-2 border-primary-500 rounded-xl px-4 py-3">
                    <div className="flex-1">
                        <div className="font-semibold text-primary-900">{selectedOption.label}</div>
                        {selectedOption.sublabel && (
                            <div className="text-sm text-primary-700">{selectedOption.sublabel}</div>
                        )}
                    </div>
                    {onUnlock && (
                        <button
                            onClick={handleUnlock}
                            className="p-1 hover:bg-primary-100 rounded-lg transition-colors"
                            title="Change selection"
                        >
                            <X className="w-5 h-5 text-primary-600" />
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
                    className="flex items-center gap-2 bg-gray-50 border-2 border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-primary-400 transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <div className="flex-1">
                        <div className="font-semibold text-gray-900">{selectedOption.label}</div>
                        {selectedOption.sublabel && (
                            <div className="text-sm text-gray-600">{selectedOption.sublabel}</div>
                        )}
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                            setSearchQuery('');
                        }}
                        className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Clear selection"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
        );
    }

    // Default search input
    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-300 rounded-xl 
           focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
           outline-none transition-all text-gray-900 placeholder-gray-400"
                />
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                    {filteredOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors 
               border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                        >
                            <div className="font-medium text-gray-900">{option.label}</div>
                            {option.sublabel && (
                                <div className="text-sm text-gray-600 mt-0.5">{option.sublabel}</div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && searchQuery && filteredOptions.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 text-center text-gray-500">
                    No results found
                </div>
            )}
        </div>
    );
};

export default Autocomplete;

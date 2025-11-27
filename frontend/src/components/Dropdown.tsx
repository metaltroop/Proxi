import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

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
                className={`flex items-center justify-between w-full px-4 py-3 bg-white border-2 rounded-xl cursor-pointer transition-all
                ${isOpen ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300 hover:border-primary-400'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`flex-1 ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </div>
                <div className="flex items-center gap-2">
                    {selectedOption && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            title="Clear selection"
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 origin-top">
                    {options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl
                                ${option.id === value ? 'bg-primary-50 text-primary-900' : 'hover:bg-primary-50 text-gray-900'}`}
                        >
                            <div className="font-medium">{option.label}</div>
                            {option.sublabel && (
                                <div className="text-sm text-gray-600 mt-0.5">{option.sublabel}</div>
                            )}
                        </button>
                    ))}
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-center text-gray-500">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dropdown;

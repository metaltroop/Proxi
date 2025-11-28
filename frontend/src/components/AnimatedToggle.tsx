import React from 'react';

interface AnimatedToggleProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
    isDarkMode?: boolean;
}

const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
    options,
    value,
    onChange,
    className = '',
    isDarkMode = false
}) => {
    const selectedIndex = options.findIndex(opt => opt.value === value);

    return (
        <div className={`relative inline-flex items-center rounded-xl p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} ${className}`}>
            {/* Animated background slider */}
            <div
                className={`absolute h-[calc(100%-8px)] rounded-lg transition-all duration-300 ease-ios ${isDarkMode ? 'bg-primary-600' : 'bg-white shadow-sm'}`}
                style={{
                    width: `calc(${100 / options.length}% - 8px)`,
                    left: `calc(${(selectedIndex * 100) / options.length}% + 4px)`,
                    top: '4px',
                }}
            />

            {/* Toggle buttons */}
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`relative z-10 px-6 py-2 rounded-lg font-medium transition-all duration-300 ease-ios ${value === option.value
                            ? isDarkMode
                                ? 'text-white'
                                : 'text-gray-900'
                            : isDarkMode
                                ? 'text-gray-400 hover:text-gray-300'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    style={{ flex: 1 }}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default AnimatedToggle;

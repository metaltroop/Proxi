/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
            },
            padding: {
                'safe': 'env(safe-area-inset-bottom)',
                'safe-top': 'env(safe-area-inset-top)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
            },
            transitionTimingFunction: {
                'ios': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
                'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            },
            animation: {
                'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'slide-in-left': 'slideInLeft 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'slide-out-right': 'slideOutRight 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'slide-out-left': 'slideOutLeft 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'fade-out': 'fadeOut 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'scale-out': 'scaleOut 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
            },
            keyframes: {
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideOutRight: {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(100%)', opacity: '0' },
                },
                slideOutLeft: {
                    '0%': { transform: 'translateX(0)', opacity: '1' },
                    '100%': { transform: 'translateX(-100%)', opacity: '0' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                scaleOut: {
                    '0%': { transform: 'scale(1)', opacity: '1' },
                    '100%': { transform: 'scale(0.95)', opacity: '0' },
                },
            },
        },
    },
    plugins: [
        require('tailwindcss-animate')
    ],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary brand colors - Lighter Gold palette
                primary: {
                    50: '#fffdf7',
                    100: '#fef9e8',
                    200: '#fef3c3',
                    300: '#fee989',
                    400: '#fed94a',
                    500: '#fdc520',
                    600: '#eaa90d',
                    700: '#c4820a',
                    800: '#9b6511',
                    900: '#7d5314',
                },
                // Secondary - Light Warm Beige
                secondary: {
                    50: '#fefcf9',
                    100: '#fdf8f1',
                    200: '#faf0e4',
                    300: '#f5e4d0',
                    400: '#edd4b8',
                    500: '#e2c19e',
                    600: '#d4a97c',
                    700: '#c08d60',
                    800: '#a1724e',
                    900: '#835d42',
                },
                // Accent colors - Lighter shades
                accent: {
                    gold: '#f5c842',
                    champagne: '#fff8e7',
                    bronze: '#dda15e',
                    rose: '#f5d0cd',
                    cream: '#fffef5',
                    honey: '#ffeaa7',
                },
                // Light theme backgrounds - Warmer
                light: {
                    bg: '#fffefb',
                    card: '#ffffff',
                    border: '#fef3dc',
                    surface: '#fffcf5',
                    hover: '#fffaf0',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
                'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
                'pulse-gold': 'pulseGold 2s ease-in-out infinite',
                'gradient': 'gradient 8s linear infinite',
                'sparkle': 'sparkle 1.5s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 },
                },
                fadeIn: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.9)', opacity: 0 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                pulseGold: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(253, 197, 32, 0.2)' },
                    '50%': { boxShadow: '0 0 40px rgba(253, 197, 32, 0.4)' },
                },
                gradient: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                sparkle: {
                    '0%, 100%': { opacity: 0.5, transform: 'scale(0.8)' },
                    '50%': { opacity: 1, transform: 'scale(1.2)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
                'shimmer': 'linear-gradient(90deg, transparent, rgba(253, 197, 32, 0.15), transparent)',
                'gold-gradient': 'linear-gradient(135deg, #f5c842, #ffd966, #f5c842)',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 10px 20px -2px rgba(0, 0, 0, 0.03)',
                'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 2px 10px -2px rgba(0, 0, 0, 0.03)',
                'soft-xl': '0 20px 50px -12px rgba(0, 0, 0, 0.12)',
                'gold': '0 4px 20px rgba(253, 197, 32, 0.15)',
                'gold-lg': '0 10px 40px rgba(253, 197, 32, 0.2)',
                'glow-gold': '0 0 30px rgba(253, 197, 32, 0.25)',
                'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                'card-gold': '0 4px 20px rgba(253, 197, 32, 0.08), 0 0 0 1px rgba(253, 197, 32, 0.05)',
            },
        },
    },
    plugins: [],
}

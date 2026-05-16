import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'
import animate from 'tailwindcss-animate'

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-geist-sans)', ...fontFamily.sans],
                display: ['var(--font-space-grotesk)', ...fontFamily.sans],
                mono: ['var(--font-geist-mono)', ...fontFamily.mono],
            },
            colors: {
                brand: {
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
                    950: '#172554',
                },
                neon: {
                    blue: '#00d4ff',
                    green: '#00ff94',
                    yellow: '#ffeb00',
                    red: '#ff3d3d',
                    purple: '#b94fff',
                },
                sport: {
                    football: '#22c55e',
                    cricket: '#f59e0b',
                    basketball: '#f97316',
                    tennis: '#84cc16',
                    f1: '#dc2626',
                    ufc: '#7c3aed',
                    rugby: '#4f46e5',
                },
                live: '#ef4444',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f2044 100%)',
                'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                'live-glow': 'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
            },
            animation: {
                'ticker': 'ticker 30s linear infinite',
                'live-pulse': 'live-pulse 2s ease-in-out infinite',
                'score-update': 'score-update 0.5s ease-out',
                'slide-up': 'slide-up 0.4s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'shimmer': 'shimmer 1.5s infinite',
                'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
            },
            keyframes: {
                ticker: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                'live-pulse': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.5', transform: 'scale(0.95)' },
                },
                'score-update': {
                    '0%': { transform: 'scale(1.3)', color: '#22c55e' },
                    '100%': { transform: 'scale(1)', color: 'inherit' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                'bounce-subtle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
            },
            boxShadow: {
                'card-hover': '0 20px 60px -10px rgba(0,0,0,0.4)',
                'live': '0 0 20px rgba(239,68,68,0.3)',
                'neon-blue': '0 0 30px rgba(0,212,255,0.2)',
                'glow': '0 0 40px rgba(59,130,246,0.3)',
            },
        },
    },
    plugins: [animate],
}

export default config
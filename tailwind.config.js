/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Titan Group Partners Brand Colors (from logo)
        titan: {
          navy: '#0d1b4d',      // Deep navy - primary brand color
          royal: '#1a3a7a',     // Royal blue - secondary
          steel: '#4a6eb5',     // Steel/metallic blue - accent
          light: '#6b87c7',     // Light blue - highlights
          accent: '#8fa8d9',    // Soft blue - hover states
          pale: '#b8c9eb',      // Very light blue - borders
        },
        // Editor UI Colors
        editor: {
          bg: '#0a0f1c',        // Main background
          panel: '#111827',     // Panel background
          surface: '#1f2937',   // Elevated surfaces
          border: '#374151',    // Borders
          hover: '#4b5563',     // Hover states
        },
        // Semantic Colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Clash Display', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'titan': '0 0 30px rgba(26, 58, 122, 0.3)',
        'titan-lg': '0 0 60px rgba(26, 58, 122, 0.4)',
        'glow': '0 0 20px rgba(74, 110, 181, 0.5)',
      },
      backgroundImage: {
        'titan-gradient': 'linear-gradient(135deg, #0d1b4d 0%, #1a3a7a 50%, #4a6eb5 100%)',
        'titan-radial': 'radial-gradient(ellipse at center, #1a3a7a 0%, #0d1b4d 70%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        imd: {
          navy: '#082046',      // Official IMD top bar dark navy
          blue: '#0E468A',      // Official primary royal blue
          accent: '#1976D2',    // Accent sky blue
          lightBg: '#F0F4F8',   // Light app background
          card: '#FFFFFF',      // Clean card surface
          textMain: '#0F172A',  // Deep charcoal text
          textMuted: '#475569', // Slate muted text
          // Official 4-Color IMD Alert Matrix
          green: '#2E7D32',     // No Warning
          yellow: '#F9A825',    // Watch (Be Updated)
          orange: '#E65100',    // Alert (Be Prepared)
          red: '#C62828',       // Warning (Take Action)
        },
        primary: {
          DEFAULT: '#0E468A',
          dark: '#082046',
        },
        secondary: '#00897B',
        accent: '#F9A825',
        alert: {
          red: '#C62828',
          amber: '#E65100',
          yellow: '#F9A825',
          green: '#2E7D32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Lora', 'serif'],
      },
      boxShadow: {
        'imd': '0 2px 8px -1px rgba(8, 32, 70, 0.08), 0 1px 4px -1px rgba(8, 32, 70, 0.04)',
        'imd-hover': '0 8px 16px -2px rgba(8, 32, 70, 0.12), 0 2px 6px -1px rgba(8, 32, 70, 0.06)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'zen': ['Zen Kaku Gothic Antique', 'sans-serif'],
        'zen-bold': ['Zen Kaku Gothic Antique-Bold', 'sans-serif'],
        'zen-medium': ['Zen Kaku Gothic Antique-Medium', 'sans-serif'],
        'zen-light': ['Zen Kaku Gothic Antique-Light', 'sans-serif'],
      },
      colors: {
        // Brand colors for consistent usage
        brand: {
          'dark-green': '#0e4336',
          'accent-green': '#0ea06c',
          'light-green': '#ffffff',
          'border-green': '#d7ebe3',
          'text-green': '#2c4a43',
        },
        // Semantic colors
        success: {
          light: '#dcfce7',
          DEFAULT: '#16a34a',
          dark: '#15803d',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        error: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
        info: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'custom-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};

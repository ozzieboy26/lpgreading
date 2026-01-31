import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ededed',
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
        secondary: {
          DEFAULT: '#1f2937',
          dark: '#111827',
          light: '#374151',
        },
        accent: {
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        danger: {
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
export default config

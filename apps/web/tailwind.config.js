/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#07090E',
          900: '#0D1117',
          850: '#131922',
          800: '#1A2230',
          700: '#283446',
          600: '#3D4D66',
          accent: '#3B82F6',
          gold: '#F59E0B',
          emerald: '#10B981',
          crimson: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}

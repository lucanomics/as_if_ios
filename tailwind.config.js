/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Calm public-institution palette for Desksht.
        ink: '#17211f',
        muted: '#64706d',
        line: '#dbe4e1',
        slatebg: '#eef3f5',
        accent: {
          DEFAULT: '#006f63',
          dark: '#00584f',
          strong: '#00675d',
          soft: '#e8f4f1',
        },
        risk: {
          low: '#2f855a',
          caution: '#b7791f',
          high: '#c53030',
          officer: '#5a3e9c',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

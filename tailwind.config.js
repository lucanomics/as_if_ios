/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Calm public-institution palette
        ink: '#1f2933',
        slatebg: '#f4f6f8',
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

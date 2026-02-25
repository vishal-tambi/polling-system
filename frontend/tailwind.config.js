/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#4f0dce',
                'primary-mid': '#5767d0',
                'primary-light': '#7765da',
                surface: '#ffffff',
                'card-bg': '#f2f2f2',
                'text-primary': '#1a1a1a',
                'text-secondary': '#6e6e6e',
                'timer-red': '#e53e3e',
                'question-header': '#595959',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

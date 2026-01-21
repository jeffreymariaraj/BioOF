/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'bio-dark': '#0f172a',
                'bio-panel': '#1e293b',
                'bio-accent': '#38bdf8',
            }
        },
    },
    plugins: [],
}

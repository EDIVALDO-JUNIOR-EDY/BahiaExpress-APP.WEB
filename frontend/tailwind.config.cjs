// C:/dev/frontend/tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#003366',
        'brand-yellow': '#FFD700',
        'brand-background': '#F7F7F7',
        'brand-surface': '#FFFFFF',
        'brand-text-primary': '#1A202C',
        'brand-text-secondary': '#718096',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
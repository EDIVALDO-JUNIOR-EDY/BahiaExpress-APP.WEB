// frontend/tailwind.config.js

import forms from '@tailwindcss/forms'; // <-- CORREÇÃO: Importa usando sintaxe ES Module

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    forms, // <-- CORREÇÃO: Usa a variável importada
  ],
}
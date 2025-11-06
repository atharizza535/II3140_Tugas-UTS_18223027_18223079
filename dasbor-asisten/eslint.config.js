import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Abaikan folder build dan node_modules di kedua proyek
  globalIgnores(['dist', 'functions/node_modules']),

  // 1. Konfigurasi untuk FRONTEND (React/Vite)
  {
    files: ['src/**/*.{js,jsx}'], // <-- Hanya berlaku untuk folder 'src'
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser, // <-- Aturan untuk Browser
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // 2. Konfigurasi untuk BACKEND (Firebase Functions)
  {
    files: ['functions/**/*.js'], // <-- Hanya berlaku untuk folder 'functions'
    languageOptions: {
      ecmaVersion: 2021,
      globals: globals.node, // <-- Aturan untuk Node.js (mengenali require, module, dll)
      sourceType: 'commonjs', // <-- Penting: menandakan ini file CommonJS
    },
    rules: {
      "quotes": ["error", "double"],
      "max-len": "off",
      "require-jsdoc": "off",
    },
  }
])
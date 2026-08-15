/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    environmentOptions: {
      // jsdom defaults to about:blank, which is an opaque origin — localStorage
      // is unavailable there and every test blows up in setup.
      jsdom: { url: 'http://localhost:5173' },
    },
  },
})

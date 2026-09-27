/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    /*
     * Satu bundel untuk semua. `es2019` adalah sintaks modern tertinggi yang
     * dipahami WebView bawaan Android (Capacitor mensyaratkan Chrome 60+).
     * Kalau ini dinaikkan ke bawaan Vite (Chrome 107+), WebView lama gagal
     * mem-parse bundel dan aplikasi hanya menampilkan layar putih kosong.
     */
    target: 'es2019',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})

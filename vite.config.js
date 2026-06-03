import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // 多入口：主站 (/) + Creative Experiences montage (/experiences.html)
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        experiences: resolve(import.meta.dirname, 'experiences.html'),
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6101,
    strictPort: true,
    watch: {
      // Windows 下 native watcher 易遇 EBUSY，改用轮询更稳定
      usePolling: true,
      interval: 1000,
      ignored: ['**/.git/**', '**/*.rar', '**/*.zip'],
    },
  },
  preview: {
    port: 6102,
    strictPort: true,
  },
})

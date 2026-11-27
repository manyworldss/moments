import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // data/moments.json lives one level up, outside web/
    fs: { allow: ['..'] },
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        design: 'design.html',
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// DeskShield is a purely static SPA. No proxy, no env-based API endpoints,
// no server. `base: '/'` keeps it deployable at a Vercel domain root.
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

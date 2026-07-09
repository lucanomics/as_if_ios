import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// DeskShield is a purely static SPA. No proxy, no env-based API endpoints,
// no server. `base: '/'` keeps it deployable at a Vercel domain root.
//
// PWA (Phase 2): Workbox precaches the built asset list so the app works
// offline after the first successful load. The generated service worker makes
// NO external/runtime network calls — it only precaches same-origin assets.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'DeskShield — 비식별 창구 안내 품질관리',
        short_name: 'DeskShield',
        description: '비식별 창구 안내 품질관리 도구. 모든 기록은 브라우저 로컬에만 저장됩니다.',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1f2933',
        theme_color: '#1f2933',
        icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // 외부(cross-origin) 요청은 캐시/가로채지 않는다.
        runtimeCaching: [],
      },
    }),
  ],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

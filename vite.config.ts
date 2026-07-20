import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '동행 — The Gospel Road',
        short_name: '동행',
        description: '그분과 함께 걷는 3년. 신약 4복음서 기반 내러티브 어드벤처.',
        lang: 'ko',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0B1020',
        theme_color: '#0B1020',
        icons: [],
      },
    }),
  ],
})

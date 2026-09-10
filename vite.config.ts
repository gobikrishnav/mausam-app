import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'MAUSAM - Personalized Smart Weather',
        short_name: 'MAUSAM',
        description: 'Personalized smart weather mobile application and actionable intelligence',
        theme_color: '#0D3B8E',
        background_color: '#0F1B2D',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.data\.gov\.in\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'datagov-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/mausam\.imd\.gov\.in\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'imd-mausam-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 12 // 12 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/incois\.gov\.in\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'incois-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 12 // 12 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/datagov': {
        target: 'https://api.data.gov.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/datagov/, ''),
      },
      '/api/imd': {
        target: 'https://mausam.imd.gov.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/imd/, ''),
      },
      '/api/cpcb': {
        target: 'https://app.cpcbccr.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/cpcb/, ''),
      },
      '/api/incois': {
        target: 'https://incois.gov.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/incois/, ''),
      },
    },
  },
});

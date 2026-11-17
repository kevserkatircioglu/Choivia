import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import choiviaNotifyPlugin from './scripts/choiviaNotifyPlugin.js'

export default defineConfig({
  plugins: [react(), choiviaNotifyPlugin()],
  server: {
    port: 5173,
    strictPort: true,
  },
})

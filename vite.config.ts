import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import million from 'million/compiler'
import generouted from '@generouted/react-router/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: Number(process.env.VITE_PORT) || 3000, // Set the port from VITE_PORT or fallback to 3000
  },
  plugins: [million.vite({ auto: true }), react(), generouted()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './public'),
    },
  },
})

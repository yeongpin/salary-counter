import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// get absolute path of project root directory
const rootDir = path.resolve(__dirname);

export default defineConfig({
  plugins: [vue()],
  base: './',
  root: 'src/renderer',
  publicDir: '../../public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    // use absolute path to ensure output to dist in project root directory
    outDir: path.resolve(rootDir, 'dist'),
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'cjs'
      }
    }
  }
}) 
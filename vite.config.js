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
    host: '0.0.0.0',
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
        format: 'cjs',
        entryFileNames: `assets/[name]-[hash]-${new Date().getTime()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${new Date().getTime()}.js`,
        assetFileNames: `assets/[name]-[hash]-${new Date().getTime()}.[ext]`
      }
    }
  }
}) 
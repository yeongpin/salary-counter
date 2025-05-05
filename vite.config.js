import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 获取项目根目录的绝对路径
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
    // 使用绝对路径确保输出到项目根目录下的 dist
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
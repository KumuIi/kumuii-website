import { defineConfig } from 'vite'

export default defineConfig({
  base: '/kumuii-website/', // ← Replace with your GitHub repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})

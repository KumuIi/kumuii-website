import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                games: resolve(__dirname, 'src/pages/games/games.html'),
                art: resolve(__dirname, 'src/pages/art/art.html'),
                threeDart: resolve(__dirname, 'src/pages/models/models.html'),
            },
            output: {
                entryFileNames: `assets/[name]-[hash].js`,
                chunkFileNames: `assets/[name]-[hash].js`,
                assetFileNames: `assets/[name]-[hash].[ext]`,
                manualChunks: {
                    three: ['three']
                }
            }
        },
        target: 'es2020',
        cssMinify: true,
        minify: 'esbuild'
    }
})

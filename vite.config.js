import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),                       // personal page (/)
                portfolio: resolve(__dirname, 'portfolio/index.html'),         // professional portfolio (/portfolio/)
                games: resolve(__dirname, 'portfolio/games/index.html'),       // /portfolio/games/
                art: resolve(__dirname, 'portfolio/art/index.html'),           // /portfolio/art/
                threeDart: resolve(__dirname, 'portfolio/models/index.html'),  // /portfolio/models/
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

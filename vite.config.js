import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    base: '/', // Change to '/repository-name/' if not using custom domain
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                models: resolve(__dirname, 'models.html'),
                art: resolve(__dirname, 'art.html'),
                games: resolve(__dirname, 'games.html'),
            }
        }
    }
})

import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// import vue from '@vitejs/plugin-vue'

import path from 'path'

export default defineConfig({
    plugins: [vueJsx({ mergerProps: false })],
    optimizeDeps: {
        include: ['object-assign', 'prop-types', 'react-is'],
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'lib/index.ts'),
            name: 'Vue3Emotion',
            formats: ['cjs', 'es'],
        },
        rollupOptions: {
            external: [/@emotion/, 'styled-system'],
        },
    },
})

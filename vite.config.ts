import { defineConfig } from 'vite';

export default defineConfig({
    resolve: {
        alias: {
            '@': '/src',
            '@core': '/src/core',
            '@patterns': '/src/patterns',
            '@entities': '/src/entities',
            '@systems': '/src/systems',
            '@ui': '/src/ui',
        },
    },
});

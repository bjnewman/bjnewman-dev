import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// Build React app into public/app with deterministic filenames so Eleventy
// can reference the built assets in templates.
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'public/app',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                // keep predictable names so Eleventy templates can reference them
                entryFileNames: 'assets/app.js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name][extname]'
            }
        }
    }
});

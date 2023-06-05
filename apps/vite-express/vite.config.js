import { defineConfig } from 'vite';
import path from 'path';
import { viteReynaPlugin } from '@reyna/vite';

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  build: {
    outDir: path.resolve(__dirname, 'dist')
  },
  plugins: [viteReynaPlugin('http://localhost:8000')]
});

import { defineConfig } from 'vite';
import path from 'path';
import { viteReynaPlugin } from '@reyna/vite';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true
  },
  plugins: [viteReynaPlugin({
    serverUrl: isDev? 'http://localhost:8000/': '/',
    serverBasePath: path.resolve(__dirname, 'src')
  })]
});

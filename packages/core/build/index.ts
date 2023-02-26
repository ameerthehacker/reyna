import * as vite from 'vite';
import logger from '../logger';
import * as path from 'path';
import { viteRpcPlugin } from '../plugins/vite-rpc';
import glob from 'glob';
import fs from 'fs/promises';
import * as babel from '@babel/core';

const srcDir = path.join(process.cwd(), 'src');
const distDir = path.join(process.cwd(), 'dist');

async function buildClient() {
  await vite.build({
    mode: 'production',
    root: path.join(process.cwd(), 'src'),
    build: {
      outDir: path.join(process.cwd(), 'dist'),
      assetsDir: 'static',
      emptyOutDir: true
    },
    configFile: false,
    plugins: [{
      enforce: 'pre',
      ...viteRpcPlugin(false),
    }]
  });
}

async function buildServer() {
  return new Promise<void>((resolve, reject) => {
    glob('**.server.ts', { cwd: srcDir, nodir: true, absolute: true }, async (err, matches) => {
      if (!err) {
        for (const match of matches) {
          const ext = path.extname(match);
          const relativePath = path.relative(match, path.dirname(srcDir));

          if (ext === '.js') {
            const filename = path.basename(match);

            await fs.copyFile(match, path.join(distDir, filename));
          } else if (ext === '.ts') {
            const fileContent = await fs.readFile(match, { encoding: 'utf-8' });
            const { code } = await babel.transformAsync(fileContent, { presets: ['@babel/preset-typescript'], filename: match });
            const filename = path.basename(match);
            const fileNameWithoutExt = path.parse(filename).name;

            await fs.writeFile(path.join(distDir, `${fileNameWithoutExt}.js`), code);
          }
        }

        resolve();
      } else {
        reject(err);
      }
    });
  });
}

export async function build() {
  logger.info('Starting production build...');

  await buildClient();
  await buildServer();
}

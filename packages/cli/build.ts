import logger from './logger';
import * as path from 'path';
import { viteReynaPlugin } from '@reyna/vite';
import vite from 'vite';
import ts from 'typescript';
import * as glob from 'glob';

const srcDir = path.join(process.cwd(), 'src');
const distDir = path.join(process.cwd(), 'dist');

async function buildClient() {
  await vite.build({
    mode: 'production',
    root: srcDir,
    build: {
      outDir: distDir,
      assetsDir: 'static',
      emptyOutDir: true
    },
    configFile: false,
    plugins: [
      viteReynaPlugin({
        serverBasePath: process.env.REYNA_SERVER_BASE_PATH
      })
    ]
  });
}

function buildServerFiles() {
  const serverFiles = glob.sync('./src/**/*.server.ts');
  const program = ts.createProgram(serverFiles, {
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
    outDir: './dist',
    rootDir: './src'
  });

  const emitResult = program.emit();

  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  diagnostics.forEach(diagnostic => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      );
      console.error(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): error: ${message}`
      );
    } else {
      console.error(`Error: ${message}`);
    }
  });

  if (diagnostics.length !== 0) {
    logger.error('reyna: failed to compile backend files');
  }
}

export async function build() {
  logger.info('Starting production build...');

  process.env.REYNA_SERVER_BASE_PATH = path.resolve(process.cwd(), 'src');

  logger.info('Building frontend files...');
  await buildClient();
  logger.info('Building backend files...');
  buildServerFiles();
}

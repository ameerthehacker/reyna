import vite from 'vite';
import path from 'path';
import logger from './logger';
import { startExpressServer } from './server';
import { viteReynaPlugin } from '@reyna/vite';

export type DevServerConfig = {
  hostname?: string;
  expressPort?: number;
  vitePort?: number;
};

async function startViteServer(hostname: string = '0.0.0.0', expressPort: number, port?: number) {
  const viteDevServer = await vite.createServer({
    root: path.join(process.cwd(), 'src'),
    server: {
      host: hostname,
      port,
      proxy: {
        '/reyna': `http://${hostname}:${expressPort}`
      }
    },
    configFile: false,
    plugins: [
      viteReynaPlugin({
        serverBasePath: process.env.REYNA_SERVER_BASE_PATH,
        serverUrl: '/'
      })
    ]
  });

  viteDevServer.listen().then(() => {
    logger.info('vite dev server listening at');
    viteDevServer.printUrls();
  });

  return () => viteDevServer.close();
}

export async function startDevServer({ hostname = '0.0.0.0', expressPort = 8000, vitePort }: DevServerConfig) {
  process.env.NODE_ENV = 'development';
  // ensure ts files are transpiled on the fly
  require('ts-node/register');
  // override the default server base path used by @reyna/express
  process.env.REYNA_SERVER_BASE_PATH = path.resolve(process.cwd(), 'src');

  const disposeNodeServer = startExpressServer(hostname, expressPort);
  const disposeViteServer = await startViteServer(hostname, expressPort, vitePort);

  return async () => {
    await disposeNodeServer();
    await disposeViteServer();
  }
}

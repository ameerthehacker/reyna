import logger from '../logger';
import * as vite from 'vite';
import { viteRpcPlugin } from '../plugins/vite-rpc';
import path from 'path';
import { startNodeServer } from '../server';

require('@babel/register')({
  only: [/(.*)\.server\.ts/],
  extensions: ['.ts'],
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
});

export type DevServerConfig = {
  hostname?: string;
  port?: number;
};

async function startViteServer(reynaServerHostname: string, reynaServerPort: number, hostname: string = '0.0.0.0', port: number = 3000) {
  const viteDevServer = await vite.createServer({
    root: path.join(process.cwd(), 'src'),
    server: {
      port,
      host: hostname
    },
    configFile: false,
    define: {
      REYNA_SERVER_HOST: JSON.stringify(reynaServerHostname),
      REYNA_SERVER_PORT: JSON.stringify(reynaServerPort)
    },
    plugins: [{
      enforce: 'pre',
      ...viteRpcPlugin(true),
    }]
  });

  viteDevServer.listen().then(() => {
    logger.info('vite dev server listening at');
    viteDevServer.printUrls();
  });

  return () => viteDevServer.close();
}

export async function startDevServer({ hostname = '0.0.0.0', port = 8000 }: DevServerConfig) {
  const disposeNodeServer = startNodeServer(hostname, port, true);
  const disposeViteServer = await startViteServer(hostname, port);

  return async () => {
    await disposeNodeServer();
    await disposeViteServer();
  }
}

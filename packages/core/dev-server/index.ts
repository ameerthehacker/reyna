import * as http from 'http';
import logger from '../logger';
import * as vite from 'vite';
import { viteRpcPlugin } from '../plugins/vite-rpc';

export type DevServerConfig = {
  hostname?: string;
  port?: number;
};

async function startViteServer(hostname: string = '0.0.0.0', port: number = 3000) {
  const viteDevServer = await vite.createServer({
    root: process.cwd(),
    server: {
      port,
      host: hostname
    },
    configFile: false,
    plugins: [{
      enforce: 'pre',
      ...viteRpcPlugin(),
    }]
  });

  viteDevServer.listen().then(() => {
    logger.info('vite dev server listening at');
    viteDevServer.printUrls();
  });

  return () => viteDevServer.close();
}

function startNodeServer(hostname: string, port: number) {
  const server = http.createServer((req, res) => {
    // like graphql we only have one /reyna POST route
    if (req.url === '/reyna' && req.method === 'POST') {
      res.write('hello world');
      res.end();
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  server.listen({ port, hostname })
  .on('listening', () => {
    logger.info(`reyna server listening at ${hostname}:${port}`);
  }).on('error', (err) => {
    logger.panic(`${err.name}: ${err.message}`);
  });

  const dispose = async () => {
   const serverCloseThenable = new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (!err) {
        resolve();
      } else {
        reject(err);
      }
    });
   })

   await serverCloseThenable;
  };

  return dispose;
}

export async function startDevServer({ hostname = '0.0.0.0', port = 8000 }: DevServerConfig) {
  const disposeNodeServer = startNodeServer(hostname, port);
  const disposeViteServer = await startViteServer();

  return async () => {
    await disposeNodeServer();
    await disposeViteServer();
  }
}

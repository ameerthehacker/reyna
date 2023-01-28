import * as http from 'http';
import logger from '../logger';
import * as vite from 'vite';
import { viteRpcPlugin } from '../plugins/vite-rpc';
import path from 'path';
import { performance } from 'perf_hooks';

require('@babel/register')({
  only: [/(.*)\.server\.ts/],
  extensions: ['.ts'],
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
});

export type DevServerConfig = {
  hostname?: string;
  port?: number;
};

export type RPCRequest = {
  method: string;
  params: any[];
}

export type RPCResponse = {
  result?: any;
  error?: {
    name: string;
    message: string;
    stack: string;
  };
}

async function startViteServer(reynaServerHostname: string, reynaServerPort: number, hostname: string = '0.0.0.0', port: number = 3000) {
  const viteDevServer = await vite.createServer({
    root: process.cwd(),
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
  function getRPCMessage(req: http.IncomingMessage): Promise<RPCRequest> {
    return new Promise((resolve) => {
      let body: string = "";
    
      req.on("data", data => {
        body += data;
      });
      
      req.on("end", () => {
        const rpcMessage = JSON.parse(body) as RPCRequest;
        resolve(rpcMessage);
      });
    });
  }

  const server = http.createServer(async (req, res) => {
    // like graphql we only have one /reyna POST route
    if (req.url === '/reyna' && (req.method === 'POST' || req.method === 'OPTIONS')) {
      const requestStartTime = performance.now();

      // TODO: avoid this header during prod build
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      res.setHeader('Access-Control-Request-Headers', '*');
      res.setHeader('Access-Control-Allow-Credentials', '*');

      if (req.method === 'POST') {
        const rpcMessage = await getRPCMessage(req);
        logger.info(`[REQ] ${rpcMessage.method}(${rpcMessage.params})`);

        // identify and import the *.server.(js|ts) file
        const rpcMethodParts = rpcMessage.method.split('/');
        const serverModuleRelativePath = rpcMethodParts.slice(0, rpcMethodParts.length - 1).join('/');
        const methodName = rpcMethodParts[rpcMethodParts.length - 1];
        const severModuleAbsolutePath = path.resolve(process.cwd(), serverModuleRelativePath);
        const serverModule = require(severModuleAbsolutePath);

        try {
          if (serverModule[methodName]) {
            // execute the actual server method
            const result = await serverModule[methodName](...rpcMessage.params);
            const rpcResponse: RPCResponse = { result };

            res.write(JSON.stringify(rpcResponse));
          }
          else {
            const rpcResponse: RPCResponse = {
              error: {
                name: 'Internal Error',
                message: `method ${methodName} was not found in the server module ${serverModuleRelativePath}`,
                stack: ''
              }
            }
  
            res.write(JSON.stringify(rpcResponse));
          }
        } catch (err) {
          const rpcResponse: RPCResponse = {
            error: {
              name: err.name,
              message: err.message,
              stack: err.stack
            }
          }

          res.write(JSON.stringify(rpcResponse));
        }

        const requestEndTime = performance.now();

        logger.info(`[RES] ${rpcMessage.method}(${rpcMessage.params}) took ${Math.ceil(requestEndTime - requestStartTime)}ms`);
      }

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
  process.env.REYNA_SERVER_PORT = `${port}`;

  const disposeNodeServer = startNodeServer(hostname, port);
  const disposeViteServer = await startViteServer(hostname, port);

  return async () => {
    await disposeNodeServer();
    await disposeViteServer();
  }
}

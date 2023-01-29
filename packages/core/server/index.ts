import logger from '../logger';
import { RPCRequest, RPCResponse } from '../types';
import * as path from 'path';
import express from 'express';
import { performance } from 'perf_hooks';
import cors from 'cors';

export function startNodeServer(hostname: string, port: number, isDev: boolean) {
  const distDir = path.join(process.cwd(), 'dist');
  const app = express();

  app.use(express.json());
  if (isDev) {
    app.use(cors());
  } else {
    app.use(express.static(distDir))
  }

  app.post<{}, {}, RPCRequest>('/reyna', async (req, res) => {
    const requestStartTime = performance.now();
    const rpcMessage = req.body;

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

        res.json(rpcResponse);
      }
      else {
        const rpcResponse: RPCResponse = {
          error: {
            name: 'Internal Error',
            message: `method ${methodName} was not found in the server module ${serverModuleRelativePath}`,
            stack: ''
          }
        }

        res.json(rpcResponse);
      }
    } catch (err) {
      const rpcResponse: RPCResponse = {
        error: {
          name: err.name,
          message: err.message,
          stack: err.stack
        }
      }

      res.json(rpcResponse);
    }

    const requestEndTime = performance.now();

    logger.info(`[RES] ${rpcMessage.method}(${rpcMessage.params}) took ${Math.ceil(requestEndTime - requestStartTime)}ms`);
  });

  if (isDev) {
    app.use('*', (_, res) => {
      res.sendStatus(404);
    });
  } else {
    app.use('*', (_, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = app.listen({ hostname, port }, () => {
    logger.info(`reyna server listening at ${hostname}:${port}`)
  });

  const dispose = () => new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  });

  return dispose;
}

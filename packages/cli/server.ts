import { reyna } from '@reyna/express';
import express from 'express';
import path from 'path';
import logger from './logger';

export function startExpressServer(hostname: string, port: number, isDev: boolean) {
  const app = express();

  if (!isDev) {
    app.use(express.static(path.resolve(__dirname, '..')));
  }

  app.use(express.json());
  app.use(reyna);

  const server = app.listen({ hostname, port }, () => {
    logger.info(
      `Express server running in ${isDev? 'development': 'production'} mode at http://${hostname}:${port} 🚀`
    );
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

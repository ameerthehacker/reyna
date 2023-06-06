import { reyna } from '@reyna/express';
import express from 'express';
import path from 'path';
import logger from './logger';

export function startExpressServer(hostname: string, port: number) {
  const app = express();
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
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

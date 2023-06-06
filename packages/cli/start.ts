import { startExpressServer } from "./server";
import path from 'path';

export type ServerConfig = {
  hostname?: string;
  port?: number;
};

export async function start({ hostname = '0.0.0.0', port = 8000 }: ServerConfig) {
  process.env.REYNA_SERVER_BASE_PATH = path.resolve(process.cwd(), 'dist');

  return startExpressServer(hostname, port);
}

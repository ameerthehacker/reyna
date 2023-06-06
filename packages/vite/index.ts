import { babelReynaTransformPlugin } from '@reyna/babel';
import * as babel from '@babel/core';
import path from 'path';

type ViteReynaPluginConfig = {
  serverUrl: string;
  serverBasePath: string;
}

const SERVER_REGEX = /(.*)\.server(\.(jsx?|tsx?))?/;

export function viteReynaPlugin(config: ViteReynaPluginConfig) {
  return {
    name: 'vite-reyna-plugin',
    enforce: 'pre' as 'pre' | 'post',
    resolveId(id: string) {
      if (SERVER_REGEX.test(id)) {
        return { id: path.resolve(__dirname, '..', 'proxy.js') };
      }

      return null;
    },
    async transform(source, id) {
      if (/\.(js|ts)$/.test(id)) {
        const { code, map } = await babel.transformAsync(
          source,
          {
            presets: ['@babel/preset-typescript', '@babel/preset-react'],
            plugins: [babelReynaTransformPlugin(config.serverBasePath)],
            filename: id
          }
        );
  
        return { code, map };
      }
    },
    config(_, env) {
      const buildConfig = {
        rollupOptions: {
          input: {
            exclude: SERVER_REGEX,
          },
        }
      };

      return {
        define: {
          REYNA_ENDPOINT: JSON.stringify(`${config.serverUrl}reyna`)
        },
        build: env.mode === 'development'? buildConfig: {}
      }
    }
  }
}

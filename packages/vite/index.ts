import { babelReynaTransformPlugin } from '@reyna/babel';
import * as babel from '@babel/core';
import path from 'path';

export function viteReynaPlugin(serverUrl: string) {
  return {
    name: 'vite-reyna-plugin',
    enforce: 'pre',
    resolveId(id: string) {
      const matcher = /(.*)\.server(\.(js|ts))?/;
      
      if (matcher.test(id)) {
        return { id: path.resolve(__dirname, '..', 'proxy.ts') };
      }

      return null;
    },
    async transform(source, id) {
      if (/\.(js|ts)$/.test(id)) {
        const { code, map } = await babel.transformAsync(
          source,
          {
            presets: ['@babel/preset-typescript', '@babel/preset-react'],
            plugins: [babelReynaTransformPlugin],
            filename: id
          }
        );
  
        return { code, map };
      }
    },
    config() {
      return {
        define: {
          REYNA_ENDPOINT: JSON.stringify(`${serverUrl}/reyna`)
        }
      }
    }
  }
}

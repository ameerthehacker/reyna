import * as path from 'path';
import * as babel from '@babel/core';
import reynaProxyTransformPlugin from './babel-reyna-transform';

export function viteRpcPlugin() {
  return {
    name: 'vite-rpc-plugin',
    async resolveId(id: string, importer) {
      if (/(.*)\.server(\.(js|ts))?/.test(id)) {
        return { id: path.resolve(__dirname, '../../proxy/index.ts') };
      }

      return null;
    },
    async transform(source, id) {
      if (/\.(js|ts)$/.test(id)) {
        const { code, map } = await babel.transformAsync(
          source,
          {
            presets: ['@babel/preset-typescript', '@babel/preset-react'],
            plugins: [reynaProxyTransformPlugin],
            filename: id
          }
        );
  
        return { code, map };
      }
    }
  }
}

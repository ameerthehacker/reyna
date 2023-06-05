import path from 'path';
import type { NodePath, types } from '@babel/core';

interface Babel {
  types: typeof types
}

export function babelReynaTransformPlugin(babel: Babel) {
  const { types: t } = babel;

  return {
    name: "babel-reyna-transform",
    visitor: {
      ImportDeclaration(nodePath: babel.NodePath<babel.types.ImportDeclaration>, state: any) {
        if (/(.*)\.server(\.(js|ts))?/.test(nodePath.node.source.value)) {
          const createProxyLocal = nodePath.scope.generateUidIdentifier("createReynaProxy");
          const proxyLocal = nodePath.scope.generateUidIdentifier("reynaProxy");
          const serverFileAbsolutePath = path.resolve(path.dirname(state.file.opts.filename), nodePath.node.source.value);
          const serverFilePath = path.relative(process.cwd(), serverFileAbsolutePath);
        
          nodePath.node.specifiers.forEach(specifier => {
            if (t.isImportSpecifier(specifier)) {
              nodePath.scope.rename(specifier.local.name, `${proxyLocal.name}.${specifier.local.name}`)
            } else if (t.isImportDefaultSpecifier(specifier)) {
              nodePath.scope.rename(specifier.local.name, proxyLocal.name)
            } else if (t.isImportNamespaceSpecifier(specifier)) {
              nodePath.scope.rename(specifier.local.name, proxyLocal.name)
            }
          });
          
          nodePath.node.specifiers = [t.importNamespaceSpecifier(createProxyLocal)];
          nodePath.insertAfter(
            t.variableDeclaration('const', [t.variableDeclarator(proxyLocal, t.callExpression(createProxyLocal, [t.stringLiteral(serverFilePath)]))])
          )
        }
      }
    }
  };
}

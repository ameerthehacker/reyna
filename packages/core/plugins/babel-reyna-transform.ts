import * as path from 'path';
import * as babel from '@babel/core';

export default function reynaProxyTransformPlugin () {
  const { types: t } = babel;

  return {
    name: "reyna-proxy-transform",
    visitor: {
      ImportDeclaration(nodePath: babel.NodePath<babel.types.ImportDeclaration>, state: any) {
        if (/(.*)\.server(\.(js|ts))?/.test(nodePath.node.source.value)) {
          const createProxyLocal = nodePath.scope.generateUidIdentifier("createReynaProxy");
          const proxyLocal = nodePath.scope.generateUidIdentifier("reynaProxy");
          const reynaRouteAbsolutePath = path.resolve(path.dirname(state.file.opts.filename), nodePath.node.source.value);
          const reynaRoute = path.relative(process.cwd(), reynaRouteAbsolutePath);
        
          nodePath.node.specifiers.forEach(specifier => {
            if (t.isImportSpecifier(specifier)) {
              nodePath.scope.rename(specifier.local.name, `${proxyLocal.name}.${specifier.local.name}`)
            } else if (t.isImportDefaultSpecifier(specifier)) {
              nodePath.scope.rename(specifier.local.name, proxyLocal.name)
            } else if (t.isImportNamespaceSpecifier(specifier)) {
              nodePath.scope.rename(specifier.local.name, proxyLocal.name)
            }
          });
          
          nodePath.node.specifiers = [t.importDefaultSpecifier(createProxyLocal)];
          nodePath.insertAfter(
            t.variableDeclaration('const', [t.variableDeclarator(proxyLocal, t.callExpression(createProxyLocal, [t.stringLiteral(reynaRoute)]))])
          )
        }
      }
    }
  };
}
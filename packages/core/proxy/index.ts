// @ts-nocheck
const mode = import.meta.env['MODE'] as 'development' | 'production';
const reynaServerURL = mode === 'development'? `http://${window.REYNA_SERVER_HOST}:${window.REYNA_SERVER_PORT}/`: '/';
const reynaEndpoint = `${reynaServerURL}reyna`;

function createProxy(reynaRoute) {
  return new Proxy({}, {
    get: (_, property: string) => {
      return async (...args) => {
        const res = await fetch(reynaEndpoint, {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({
            method: `${reynaRoute}/${property}`,
            params: args
          })
        });

        if (res.ok) {
          const resJSON = await res.json();

          if (resJSON.result) {
            return resJSON.result;
          } else {
            const rpcError = resJSON.error;
            const error = new Error();

            error.name = rpcError.name;
            error.message = rpcError.message;
            error.stack = rpcError.stack;

            throw error;
          }
        } else {
          const resTxt = res.text();

          throw new Error(resTxt);
        }
      }
    }
  });
}

export default createProxy;

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

        return res;
      }
    }
  });
}

export default createProxy;

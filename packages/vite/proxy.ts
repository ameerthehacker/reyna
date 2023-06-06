// @ts-expect-error
const REYNA_ENDPOINT = window.REYNA_ENDPOINT;

if (!REYNA_ENDPOINT) {
  throw new Error('REYNA_ENDPOINT is not defined, this was supposed to be handled by reyna bundler plugin');
}

function createProxy(serverFilePath) {
  return new Proxy({}, {
    get: (_, property: string) => {
      return async (...args) => {
        const response = await fetch(REYNA_ENDPOINT, {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({
            method: `${serverFilePath}/${property}`,
            params: args
          })
        });

        if (response.ok) {
          const responseAsJSON = await response.json();

          if (!responseAsJSON.error) {
            return responseAsJSON.result;
          } else {
            const rpcError = responseAsJSON.error;
            const error = new Error();

            error.name = rpcError.name;
            error.message = rpcError.message;
            error.stack = rpcError.stack;

            throw error;
          }
        } else {
          const responseAsText = await response.text();

          throw new Error(responseAsText);
        }
      }
    }
  });
}

export default createProxy;

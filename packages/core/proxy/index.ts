function createProxy(reynaRoute) {
  return new Proxy({}, {
    get: (_, property: string) => {
      return (...args) => {
        console.log(`function ${property} called with args ${args} on route ${reynaRoute}`)
      }
    }
  });
}

export default createProxy;

export type RPCRequest = {
  method: string;
  params: any[];
}

export type RPCResponse = {
  result?: any;
  error?: {
    name: string;
    message: string;
    stack: string;
  };
}

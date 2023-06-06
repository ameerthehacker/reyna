import { Request, Response, NextFunction, Router } from 'express';
import path from 'path';

const ERRORS = {
  NOT_FOUND: {
    code: 1,
    error: 'Function definition not found'
  }
}

export function reyna(req: Request, res: Response, next: NextFunction) {
  const router = Router();

  router.post('/reyna', async (req: Request<{}, {}, {
    method: string,
    params: string[]
  }>, res: Response) => {
    const { method, params } = req.body;
    const functionName = path.basename(method);
    const relativeFilePath = path.dirname(method);
    const serverBasePath = process.env.REYNA_SERVER_BASE_PATH  || path.dirname(require.main.filename);
    const absoluteFilePath = path.resolve(serverBasePath, relativeFilePath);

    const _function = require(absoluteFilePath)[functionName] as Function;

    if (_function) {
      try {
        const result = await _function.apply(null, params);

        res.json({
          result
        });
      } catch (err) {
        res.json({
          error: {
            name: err.name,
            message: err.message,
            stack: err.stack
          }
        })
      }
    } else {
      res.sendStatus(404);
      res.json(ERRORS.NOT_FOUND);
    }
  });

  router(req, res, next);
}

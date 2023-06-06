import { Request, Response, NextFunction, Router } from 'express';
import path from 'path';

const ERRORS = {
  NOT_FOUND: {
    code: 1,
    error: 'Function definition not found'
  },
  MODULE_NOT_FOUND: {
    code: 2,
    error: 'Backend file not found'
  },
  INTERNAL_ERROR: {
    code: 3,
    error: 'Internal Error'
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

    try {
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
        res.statusCode = 404;
        res.json(ERRORS.NOT_FOUND);
      }
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        res.statusCode = 404;
        res.json(ERRORS.MODULE_NOT_FOUND);
      } else {
        res.statusCode = 500;
        res.json(ERRORS.INTERNAL_ERROR);
      }
    }
  });

  router(req, res, next);
}

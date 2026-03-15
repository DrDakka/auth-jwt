import http from 'http';
import { dbSetup } from './db/index.ts';
import validation from './validation/index.ts';
import middleware from './middleware/index.ts';
import getRouteConfig from './router/index.ts';
import type { Ctx } from './static/types/index.ts';
import utils from './utils/index.ts';

export async function createServer() {
  await dbSetup();

  return http.createServer(async (req, res) => {
    utils.setCorsHeaders(res);

    // Handle preflight OPTIONS
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();

      return;
    }

    try {
      const { endpoint, method, param } = validation.validateRequest(req);

      const { auth, schema, ctr } = getRouteConfig(endpoint, method);
      let user = null;

      if (auth) {
        user = middleware.tokenAuth(req);
      }

      const body = schema
        ? validation.validateBody(await middleware.parseBody(req), schema)
        : null;

      const ctx: Ctx<typeof schema> = {
        req,
        res,
        body,
        usr: user,
        param,
      };

      await ctr(ctx);
    } catch (error) {
      middleware.handleError(res, error);
    }
  });
}

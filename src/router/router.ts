import controllers from '../controllers/index.ts';
import { RequestError } from '../errors/index.ts';
import { ep, httpStatus, methods, sch } from '../static/index.ts';
import type { Schema, Ctx, Endpoint, Method } from '../static/types/index.ts';

type RouteEntry<S extends Schema | null> = {
  auth: boolean;
  schema: S;
  ctr: (args: Ctx<S>) => void | Promise<void>;
};

const routeMap = {
  [ep.idx]: {
    [methods.get]: { auth: false, schema: null, ctr: controllers.idx },
  },
  [ep.auth]: {
    [methods.post]: {
      auth: false,
      schema: sch.auth,
      ctr: controllers.auth.man,
    },
  },
  [ep.refr]: {
    [methods.post]: { auth: false, schema: null, ctr: controllers.auth.rfr },
  },
  [ep.lgt]: {
    [methods.patch]: { auth: true, schema: null, ctr: controllers.auth.lgt },
  },
  [ep.reg]: {
    [methods.post]: { auth: false, schema: sch.reg, ctr: controllers.reg.reg },
  },
  [ep.act]: {
    [methods.get]: { auth: false, schema: null, ctr: controllers.reg.act },
  },
  [ep.prf]: {
    [methods.get]: { auth: true, schema: null, ctr: controllers.acc.get },
    [methods.del]: { auth: true, schema: null, ctr: controllers.acc.del },
    [methods.patch]: {
      auth: true,
      schema: sch.upd,
      ctr: controllers.acc.patch,
    },
  },
  [ep.pwc]: {
    [methods.patch]: {
      auth: true,
      schema: sch.pwdUpd,
      ctr: controllers.acc.pwd,
    },
  },
  [ep.pwrr]: {
    [methods.post]: {
      auth: false,
      schema: sch.pwdReq,
      ctr: controllers.res.req,
    },
  },
  [ep.pwrc]: {
    [methods.post]: {
      auth: false,
      schema: sch.pwdRes,
      ctr: controllers.res.prc,
    },
  },
} as const;

const getRouteConfig = <S extends Schema | null>(
  endpoint: Endpoint,
  method: Method,
): RouteEntry<S> => {
  const endpointRoutes = routeMap[endpoint];
  const config = endpointRoutes[method as keyof typeof endpointRoutes];

  if (!config) {
    throw new RequestError(
      `Method ${method} is not supported for ${endpoint} endpoint`,
      httpStatus.methodNotAllowed,
    );
  }

  return config;
};

export default getRouteConfig;

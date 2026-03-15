import bcrypt from 'bcrypt';
import { RequestError } from '../errors/index.ts';
import services from '../services/index.ts';
import { httpStatus, TKN, sch } from '../static/index.ts';
import utils from '../utils/index.ts';
import type { Ctx } from '../static/types/index.ts';
import {
  cookieNames,
  buildCookieHeader,
  handleTokens,
} from './helpers/helpers.ts';

async function manual(ctx: Ctx<typeof sch.auth>): Promise<void> {
  const { res, body } = ctx;
  const { email, password } = body;

  const user = await services.user.getByEmail(email);

  if (!user.activated) {
    throw new RequestError(
      'Please activate your account before logging in',
      httpStatus.unauthorized,
    );
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new RequestError('Invalid credentials', httpStatus.unauthorized);
  }

  const { id, name } = user;
  const payload = { id, name, email };

  await handleTokens(res, payload);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Authorized', user: { id, name, email } }));
}

async function refresh(ctx: Ctx<false>) {
  const { req, res } = ctx;
  const cookies = utils.parseCookies(req);
  const token = cookies[cookieNames[TKN.RFR]];

  if (!token) {
    throw new RequestError('No token provided', httpStatus.unauthorized);
  }

  const { type, ...payload } = utils.jwt.ver(token);

  if (type !== TKN.RFR) {
    throw new RequestError('Invalid token type', httpStatus.unauthorized);
  }

  const dbToken = await services.token.getByToken(token);

  await services.token.delete(dbToken.id);

  await handleTokens(res, payload);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Authorized', user: { ...payload } }));
}

async function logout(ctx: Ctx<false>) {
  const { req, res } = ctx;
  const cookies = utils.parseCookies(req);
  const refreshToken = cookies[cookieNames[TKN.RFR]];

  if (refreshToken) {
    try {
      const dbToken = await services.token.getByToken(refreshToken);

      await services.token.delete(dbToken.id);
    } catch {}
  }

  res.setHeader('Set-Cookie', [
    buildCookieHeader(TKN.ACC, '', '0'),
    buildCookieHeader(TKN.RFR, '', '0'),
  ]);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Logged out' }));
}

const authController = {
  man: manual,
  rfr: refresh,
  lgt: logout,
};

export default authController;

import http from 'http';
import utils from '../utils/index.ts';
import { cookieNames } from '../controllers/helpers/helpers.ts';
import { httpStatus, TKN } from '../static/index.ts';
import { RequestError } from '../errors/errors.ts';

function tokenAuth(req: http.IncomingMessage) {
  const cookies = utils.parseCookies(req);
  const token = cookies[cookieNames[TKN.ACC]];

  if (!token) {
    throw new RequestError('No token provided', httpStatus.unauthorized);
  }

  const { type, ...payload } = utils.jwt.ver(token);

  if (type !== TKN.ACC) {
    throw new RequestError('Invalid token type', httpStatus.unauthorized);
  }

  return payload;
}

export default tokenAuth;

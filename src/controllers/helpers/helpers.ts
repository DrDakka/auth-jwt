import http from 'http';
import bcrypt from 'bcrypt';
import services from '../../services/index.ts';
import { TKN, TOKEN_EXPIRY } from '../../static/index.ts';
import type { DTOUser } from '../../static/types/index.ts';
import utils from '../../utils/index.ts';

const SALT_ROUNDS = 10;

const cookieNames = {
  [TKN.ACC]: 'access_token',
  [TKN.RFR]: 'refresh_token',
};

const buildCookieHeader = (
  type: typeof TKN.ACC | typeof TKN.RFR,
  value: string,
  maxAge: string,
) =>
  `${cookieNames[type]}=${value}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=None; Secure`;

const verifyPwd = async (
  pwdhash: string,
  plaintext: string,
): Promise<boolean> => {
  return bcrypt.compare(plaintext, pwdhash);
};

const hashPwd = async (password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

async function handleTokens(res: http.ServerResponse, payload: DTOUser) {
  const accessToken = utils.jwt.create[TKN.ACC](payload);
  const refreshToken = utils.jwt.create[TKN.RFR](payload);

  await services.token.create({
    userId: payload.id,
    token: refreshToken.token,
    type: TKN.RFR,
    expiresAt: refreshToken.expiresAt,
  });

  res.setHeader('Set-Cookie', [
    buildCookieHeader(TKN.ACC, accessToken.token, TOKEN_EXPIRY[TKN.ACC][1]),
    buildCookieHeader(TKN.RFR, refreshToken.token, TOKEN_EXPIRY[TKN.RFR][1]),
  ]);
}

export { cookieNames, buildCookieHeader, verifyPwd, hashPwd, handleTokens };

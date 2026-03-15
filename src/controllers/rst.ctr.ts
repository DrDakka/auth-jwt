import dto from '../dto/index.ts';
import { RequestError } from '../errors/index.ts';
import { mailTemplate } from '../services/email/email.const.ts';
import services from '../services/index.ts';
import { httpStatus, TKN, sch } from '../static/index.ts';
import { type Ctx } from '../static/types/index.ts';
import utils from '../utils/index.ts';
import { hashPwd } from './helpers/helpers.ts';

async function requestReset(ctx: Ctx<typeof sch.pwdReq>) {
  const { res, body } = ctx;
  const { email } = body;

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');

  res.end(
    JSON.stringify({ message: 'Check your inbox for password reset link.' }),
  );

  try {
    const user = await services.user.getByEmail(email);

    await services.token.deleteByUserId(user.id, TKN.PWR);

    const { token, expiresAt } = utils.jwt.sign(dto.user(user), TKN.PWR);

    const tokenPayload = {
      userId: user.id,
      token,
      type: TKN.PWR,
      expiresAt,
    };

    const sent = await services.email.sendTemplate(
      user.email,
      token,
      mailTemplate.res,
    );

    if (sent) {
      await services.token.create(tokenPayload);
    }
  } catch (error) {
    if (
      error instanceof RequestError &&
      error.statusCode === httpStatus.notFound
    ) {
      // eslint-disable-next-line no-console
      console.warn('User not found for password reset request');
    } else {
      throw error;
    }
  }
}

async function processReset(ctx: Ctx<typeof sch.pwdRes>) {
  const { res, body } = ctx;
  const { token, newPwd } = body;

  const { type, ...payload } = utils.jwt.ver(token);

  if (type !== TKN.PWR) {
    throw new RequestError('Invalid token type', httpStatus.badRequest);
  }

  const dbToken = await services.token.getByToken(token);

  if (dbToken.userId !== payload.id) {
    throw new RequestError('Token mismatch', httpStatus.badRequest);
  }

  const hashedPassword = await hashPwd(newPwd);

  await services.user.patch(payload.id, { password: hashedPassword });

  await services.token.delete(dbToken.id);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');

  res.end(
    JSON.stringify({
      message: 'Password reset successfully. You can now login.',
    }),
  );
}

const resetController = {
  req: requestReset,
  prc: processReset,
};

export default resetController;

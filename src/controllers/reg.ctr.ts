import dto from '../dto/index.ts';
import { RequestError } from '../errors/index.ts';
import { mailTemplate } from '../services/email/email.const.ts';
import services from '../services/index.ts';
import { httpStatus, sch, TKN } from '../static/index.ts';
import type { Ctx } from '../static/types/index.ts';
import utils from '../utils/index.ts';
import { handleTokens, hashPwd } from './helpers/helpers.ts';

async function register(ctx: Ctx<typeof sch.reg>): Promise<void> {
  const { res, body } = ctx;
  const { name, email, password } = body;

  const exists = await services.user.existsByEmail(email);

  if (exists) {
    throw new RequestError(
      `User with email ${email} already exists`,
      httpStatus.badRequest,
    );
  }

  const hashedPassword = await hashPwd(password);

  const newUser = await services.user.create({
    name,
    email,
    password: hashedPassword,
  });

  const { token, expiresAt } = utils.jwt.sign(dto.user(newUser), TKN.ACT);

  const tokenPayload = {
    userId: newUser.id,
    token,
    type: TKN.ACT,
    expiresAt,
  };

  const sent = await services.email.sendTemplate(
    email,
    token,
    mailTemplate.act,
  );

  if (sent) {
    await services.token.create(tokenPayload);
  }

  res.statusCode = httpStatus.created;
  res.setHeader('Content-Type', 'application/json');

  res.end(
    JSON.stringify({
      message: 'User created. Check your email for activation link.',
      user: { id: newUser.id, name, email },
    }),
  );
}

async function activate(ctx: Ctx<false>) {
  const { res, param } = ctx;

  const token = await services.token.getByToken(param as string);

  if (token.type !== TKN.ACT) {
    throw new RequestError('Invalid token type', httpStatus.badRequest);
  }

  if (new Date(token.expiresAt) < new Date()) {
    throw new RequestError('Token expired', httpStatus.badRequest);
  }

  const user = await services.user.patch(token.userId, { activated: true });

  await services.token.delete(token.id);

  const payload = dto.user(user);

  await handleTokens(res, payload);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Activated', user: payload }));
}

const registrationController = {
  reg: register,
  act: activate,
};

export default registrationController;

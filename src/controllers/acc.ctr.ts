import dto from '../dto/index.ts';
import { RequestError } from '../errors/index.ts';
import { mailTemplate } from '../services/email/email.const.ts';
import services from '../services/index.ts';
import { httpStatus, TKN, sch } from '../static/index.ts';
import type { Ctx, DTOUser } from '../static/types/index.ts';
import { buildCookieHeader, hashPwd, verifyPwd } from './helpers/helpers.ts';

async function getAccData(ctx: Ctx<false>) {
  const { res, usr } = ctx;

  const user = await services.user.getById((usr as DTOUser).id);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(dto.user(user)));
}

async function deleteAcc(ctx: Ctx<false>) {
  const { res, usr } = ctx;

  await services.user.delete((usr as DTOUser).id);

  res.setHeader('Set-Cookie', [
    buildCookieHeader(TKN.ACC, '', '0'),
    buildCookieHeader(TKN.RFR, '', '0'),
  ]);

  res.statusCode = httpStatus.noContent;
  res.end();
}

async function patchAcc(ctx: Ctx<typeof sch.upd>) {
  const { res, body, usr } = ctx;
  const { password, email, name } = body;

  const user = await services.user.getById((usr as DTOUser).id);

  const isValid = await verifyPwd(user.password, password);

  if (!isValid) {
    throw new RequestError('Invalid credentials', httpStatus.unauthorized);
  }

  const updatePayload: { name?: string; email?: string } = {};

  if (name) {
    updatePayload.name = name;
  }

  if (email) {
    updatePayload.email = email;
  }

  const updatedUser = await services.user.patch(user.id, updatePayload);

  if (email && email !== user.email) {
    await services.email.sendTemplate(user.email, email, mailTemplate.emlChg);
  }

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(dto.user(updatedUser)));
}

async function changePass(ctx: Ctx<typeof sch.pwdUpd>) {
  const { res, body, usr } = ctx;
  const { oldPwd, newPwd } = body;

  const user = await services.user.getById((usr as DTOUser).id);

  const isValid = await verifyPwd(user.password, oldPwd);

  if (!isValid) {
    throw new RequestError('Invalid credentials', httpStatus.unauthorized);
  }

  const hashedPassword = await hashPwd(newPwd);

  await services.user.patch(user.id, { password: hashedPassword });

  res.setHeader('Set-Cookie', [
    buildCookieHeader(TKN.ACC, '', '0'),
    buildCookieHeader(TKN.RFR, '', '0'),
  ]);

  res.setHeader('Content-Type', 'application/json');
  res.statusCode = httpStatus.ok;
  res.end(JSON.stringify({ message: 'Password changed successfully' }));
}

const accountController = {
  get: getAccData,
  del: deleteAcc,
  patch: patchAcc,
  pwd: changePass,
};

export default accountController;

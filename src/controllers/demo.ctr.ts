import bcrypt from 'bcrypt';
import services from '../services/index.ts';
import { httpStatus } from '../static/index.ts';
import type { Ctx } from '../static/types/index.ts';
import { handleTokens } from './helpers/helpers.ts';
import { usrDto } from '../dto/dto.ts';

const DEMO_EMAIL = 'demo@demo.com';
const DEMO_NAME = 'Demo User';
const DEMO_PASSWORD = 'demo1234';
const SALT_ROUNDS = 10;

async function getOrCreateDemoUser() {
  const exists = await services.user.existsByEmail(DEMO_EMAIL);

  if (exists) {
    return services.user.getByEmail(DEMO_EMAIL);
  }

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const user = await services.user.create({
    name: DEMO_NAME,
    email: DEMO_EMAIL,
    password: hashedPassword,
  });

  return services.user.patch(user.id, { activated: true });
}

async function demo(ctx: Ctx<false>): Promise<void> {
  const { res } = ctx;

  const user = await getOrCreateDemoUser();
  const payload = usrDto(user);

  await handleTokens(res, payload);

  res.statusCode = httpStatus.ok;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ user: payload }));
}

export default { demo };

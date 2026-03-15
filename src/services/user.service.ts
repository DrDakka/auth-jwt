import DB from '../model/index.ts';
import { fnames, httpStatus, TNAMES } from '../static/index.ts';
import { base, dbHandler } from './repo.service.ts';
import type { Create, PatchUser } from '../static/types/index.ts';
import { RequestError } from '../errors/index.ts';

async function patchUser(id: string, payload: Partial<PatchUser>) {
  const user = await base.get(TNAMES.USR, id);

  await DB[TNAMES.USR].update(payload, { where: { id } });

  return { ...user, ...payload };
}

const userService = {
  getById: (id: string) => base.get(TNAMES.USR, id),
  getByEmail: (email: string) =>
    base.getByParam(TNAMES.USR, fnames[TNAMES.USR].email, email),
  delete: (id: string) => base.del(TNAMES.USR, id),
  create: (data: Create[typeof TNAMES.USR]) => base.create(TNAMES.USR, data),
  existsByEmail: async (email: string): Promise<boolean> => {
    try {
      await base.getByParam(TNAMES.USR, fnames[TNAMES.USR].email, email);

      return true;
    } catch (error) {
      if (
        error instanceof RequestError &&
        error.statusCode !== httpStatus.serverError
      ) {
        return false;
      }
      throw error;
    }
  },
  patch: dbHandler((id: string, payload: Partial<PatchUser>) =>
    patchUser(id, payload),
  ),
};

export default userService;

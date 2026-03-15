import DB from '../model/index.ts';
import { TNAMES, fnames } from '../static/index.ts';
import { base } from './repo.service.ts';
import type { Create, Tokens } from '../static/types/index.ts';

const tokenFieldNames = fnames[TNAMES.TKN];

const tokenService = {
  create: (data: Create[typeof TNAMES.TKN]) => base.create(TNAMES.TKN, data),
  getByToken: (token: string) =>
    base.getByParam(TNAMES.TKN, fnames[TNAMES.TKN].token, token),
  delete: (id: string) => base.del(TNAMES.TKN, id),
  deleteByUserId: async (userId: string, type?: Tokens) => {
    return DB[TNAMES.TKN].destroy({
      where: type
        ? { [tokenFieldNames.usr]: userId, [tokenFieldNames.type]: type }
        : { [tokenFieldNames.usr]: userId },
    });
  },
};

export default tokenService;

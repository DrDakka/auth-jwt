import { DBError, RequestError } from '../errors/index.ts';
import DB from '../model/index.ts';
import { fnames, httpStatus } from '../static/index.ts';
import type { Create, DBRes, Tnames, Fnames } from '../static/types/index.ts';

function dbHandler<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof RequestError) {
        throw error;
      }
      throw new DBError(
        `Database operation failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  };
}

const get = async <T extends Tnames>(
  table: T,
  key: string,
): Promise<DBRes[T]> => {
  const item = await DB[table].findByPk(key);

  if (!item) {
    throw new RequestError(
      `${table} record not found: ${key}`,
      httpStatus.notFound,
    );
  }

  return item.toJSON();
};

const del = async (table: Tnames, id: string): Promise<void> => {
  const deleted = await DB[table].destroy({
    where: { [fnames[table].id]: id },
  });

  if (deleted === 0) {
    throw new RequestError(`Id not found: ${id}`, httpStatus.notFound);
  }
};

const getByParam = async <T extends Tnames>(
  table: T,
  field: Fnames<T>,
  query: string | boolean,
): Promise<DBRes[T]> => {
  const item = await DB[table].findOne({ where: { [field as string]: query } });

  if (!item) {
    throw new RequestError(
      `${table} with ${field}=${query} not found`,
      httpStatus.notFound,
    );
  }

  return item.toJSON();
};

const create = async <T extends Exclude<Tnames, 'social_accounts'>>(
  table: T,
  data: Create[T],
): Promise<DBRes[T]> => {
  const newObj = await DB[table].create({ ...data });

  return newObj.toJSON();
};

const base = {
  get: dbHandler(get),
  del: dbHandler(del),
  getByParam: dbHandler(getByParam),
  create: dbHandler(create),
};

export { base, dbHandler };

const methods = {
  get: 'GET',
  post: 'POST',
  del: 'DELETE',
  patch: 'PATCH',
} as const;

const httpStatus = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  methodNotAllowed: 405,
  serverError: 500,
} as const;

type Method = (typeof methods)[keyof typeof methods];
type HTTPStatus = (typeof httpStatus)[keyof typeof httpStatus];

export { methods, httpStatus, type Method, type HTTPStatus };

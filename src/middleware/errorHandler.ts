import http from 'http';
import { httpStatus } from '../static/index.ts';
import { RequestError } from '../errors/index.ts';

function errorHandler(res: http.ServerResponse, error: unknown) {
  res.setHeader('Content-Type', 'application/json');

  if (error instanceof RequestError) {
    res.statusCode = error.statusCode;
    res.end(JSON.stringify({ message: error.message }));

    return;
  }

  res.statusCode = httpStatus.serverError;
  res.end(JSON.stringify({ message: 'Unexpected server error' }));
}

export default errorHandler;

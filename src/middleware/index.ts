import { parseBody } from './bodyParser.ts';
import errorHandler from './errorHandler.ts';
import tokenAuth from './tokenAuth.ts';

const middleware = {
  parseBody,
  handleError: errorHandler,
  tokenAuth,
};

export default middleware;

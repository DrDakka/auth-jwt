import parseCookies from './cookies.ts';
import jwtAction from './jwt.ts';
import setCorsHeaders from './cors.ts';

const utils = {
  jwt: jwtAction,
  parseCookies,
  setCorsHeaders,
};

export default utils;

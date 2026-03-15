import http from 'http';
import { RequestError } from '../errors/index.ts';
import { httpStatus } from '../static/index.ts';

const maxSizeLimit = 1048576;

async function parseBody(req: http.IncomingMessage, maxSize = maxSizeLimit) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    let settled = false;

    req.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    req.on('data', (chunk) => {
      if (settled) {
        return;
      }

      size += chunk.length;

      if (size > maxSize && !settled) {
        settled = true;
        req.destroy();

        reject(
          new RequestError('Body max size exceeded', httpStatus.badRequest),
        );

        return;
      }

      data += chunk;
    });

    req.on('end', () => {
      if (settled) {
        return;
      }

      try {
        settled = true;

        const parsed = JSON.parse(data);

        resolve(parsed);
      } catch {
        if (!settled) {
          settled = true;
          reject(new RequestError('Expected JSON', httpStatus.badRequest));
        }
      }
    });

    req.on('close', () => {
      if (!settled) {
        settled = true;
        reject(new RequestError('Request cancelled', httpStatus.badRequest));
      }
    });
  });
}

export { parseBody };

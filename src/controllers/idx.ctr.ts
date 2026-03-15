import type { Ctx } from '../static/types/index.ts';

const indexPage = '<h1>some-html</h1>';

function index(ctx: Ctx<null>): void {
  const { res } = ctx;

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(indexPage);
}

export default index;

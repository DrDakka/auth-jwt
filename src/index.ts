/* eslint-disable no-console */
import 'dotenv/config';
import { createServer } from './createServer.ts';

const PORT = process.env.PORT || 5700;

const server = await createServer();

server.listen(PORT, () => {
  console.log(`Server is running on: ${PORT}`);
});

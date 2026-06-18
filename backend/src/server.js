import { env } from './config/env.js';
import { pingDatabase } from './db/pool.js';
import { app } from './app.js';

async function start() {
  await pingDatabase();

  app.listen(env.port, env.host, () => {
    console.log(`WWJ Car Rent API listening on ${env.host}:${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API server');
  console.error(error);
  process.exit(1);
});

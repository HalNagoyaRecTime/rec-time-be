import https from 'https';
import fs from 'fs';
import { ENV } from './config/env';
import { createAdaptorServer } from '@hono/node-server';
import app from './index';

// HTTPS options
const httpsOptions = {
  key: fs.readFileSync(ENV.HTTPS_KEY_PATH),
  cert: fs.readFileSync(ENV.HTTPS_CERT_PATH),
};

// HTTPS サーバーを作成
const server = createAdaptorServer({
  fetch: app.fetch,
  createServer: https.createServer,
  serverOptions: httpsOptions,
});

server.listen(ENV.PORT, ENV.HOST, () => {
  console.log(`HTTPS Server running on https://localhost:${ENV.PORT}`);
});

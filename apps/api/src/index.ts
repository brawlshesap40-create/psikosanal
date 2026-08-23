import { buildServer } from "./server";
import { env } from "./env";

const app = buildServer();

app
  .listen({ port: env.PORT, host: env.HOST })
  .then(() => {
    app.log.info(`Psikosanal API listening on http://${env.HOST}:${env.PORT}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });

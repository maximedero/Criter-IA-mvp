import { buildServer } from "./api/server.js";
import { bootstrapDatabase, runMigrations } from "./services/db.js";

const app = buildServer();

bootstrapDatabase();
runMigrations();

const port = Number(process.env.PORT ?? 4000);
app.listen({ port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

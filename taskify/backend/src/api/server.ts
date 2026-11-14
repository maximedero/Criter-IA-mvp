import Fastify from "fastify";
import { registerCaseRoutes } from "./cases-routes.js";
import { registerCanvasRoutes } from "./canvas-routes.js";
import { registerAiRoutes } from "./ai-routes.js";
import { registerReviewRoutes } from "./review-routes.js";
import { registerBriefRoutes } from "./brief-routes.js";
import { registerEvaluationRoutes } from "./evaluation-routes.js";

export function buildServer() {
  const app = Fastify({ logger: true });

  app.addHook("onRequest", (request, reply, done) => {
    reply.header("Access-Control-Allow-Origin", "http://localhost:5173");
    reply.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      reply.code(204).send();
      return;
    }

    done();
  });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return reply.status(400).send({ message });
  });

  app.get("/health", async () => ({ status: "ok" }));

  registerCaseRoutes(app);
  registerCanvasRoutes(app);
  registerAiRoutes(app);
  registerReviewRoutes(app);
  registerBriefRoutes(app);
  registerEvaluationRoutes(app);

  return app;
}

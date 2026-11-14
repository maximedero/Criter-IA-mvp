import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getEvaluation, saveEvaluation } from "../services/evaluation-service.js";

const schema = z.object({
  scores: z.record(z.number().min(1).max(5))
});

export async function registerEvaluationRoutes(app: FastifyInstance): Promise<void> {
  app.post("/cases/:caseId/evaluations", async (request) => {
    const { caseId } = request.params as { caseId: string };
    const payload = schema.parse(request.body);
    return saveEvaluation(caseId, payload.scores);
  });

  app.get("/cases/:caseId/evaluations", async (request) => {
    const { caseId } = request.params as { caseId: string };
    return getEvaluation(caseId) ?? null;
  });
}

import type { FastifyInstance } from "fastify";
import { getNextQuestion } from "../services/ai-assist-service.js";

export async function registerAiRoutes(app: FastifyInstance): Promise<void> {
  app.post("/cases/:caseId/ai/questions/next", async (request, reply) => {
    const { caseId } = request.params as { caseId: string };
    const result = await getNextQuestion(caseId);
    return reply.code(200).send(result);
  });
}

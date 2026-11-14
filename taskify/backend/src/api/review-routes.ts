import type { FastifyInstance } from "fastify";
import { runCriticalReview } from "../services/review-service.js";

export async function registerReviewRoutes(app: FastifyInstance): Promise<void> {
  app.post("/cases/:caseId/review", async (request) => {
    const { caseId } = request.params as { caseId: string };
    return { findings: runCriticalReview(caseId) };
  });
}

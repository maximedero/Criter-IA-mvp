import type { FastifyInstance } from "fastify";
import { approveBrief, generateBrief, getBriefByCase } from "../services/brief-service.js";
import { transitionCaseStatus } from "../services/status-transition-service.js";

export async function registerBriefRoutes(app: FastifyInstance): Promise<void> {
  app.post("/cases/:caseId/briefs", async (request, reply) => {
    const { caseId } = request.params as { caseId: string };
    const brief = generateBrief(caseId);
    return reply.code(201).send(brief);
  });

  app.get("/cases/:caseId/briefs/current", async (request) => {
    const { caseId } = request.params as { caseId: string };
    return getBriefByCase(caseId) ?? null;
  });

  app.post("/cases/:caseId/briefs/:briefId/approve", async (request) => {
    const { caseId, briefId } = request.params as { caseId: string; briefId: string };
    const brief = approveBrief(caseId, briefId);
    transitionCaseStatus(caseId, "listo_para_elevar");
    return brief;
  });
}

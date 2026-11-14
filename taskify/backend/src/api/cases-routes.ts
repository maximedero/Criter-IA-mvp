import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createCaseSchema } from "../validation/schemas.js";
import { createCase, getCaseById, listCases } from "../services/case-service.js";
import { transitionCaseStatus } from "../services/status-transition-service.js";
import { setCaseSeverity } from "../services/severity-service.js";

const statusSchema = z.object({
  status: z.enum(["borrador", "recopilando_evidencia", "en_analisis", "listo_para_revision", "listo_para_elevar", "elevado", "cerrado"])
});

const severitySchema = z.object({
  severity: z.enum(["sin_evaluar", "baja", "media", "alta", "critica"]),
  justification: z.string().optional()
});

export async function registerCaseRoutes(app: FastifyInstance): Promise<void> {
  app.post("/cases", async (request, reply) => {
    const payload = createCaseSchema.parse(request.body);
    const item = createCase(payload);
    return reply.code(201).send(item);
  });

  app.get("/cases", async () => listCases());

  app.get("/cases/:caseId", async (request, reply) => {
    const params = request.params as { caseId: string };
    const item = getCaseById(params.caseId);

    if (!item) {
      return reply.code(404).send({ message: "Case not found" });
    }

    return item;
  });

  app.patch("/cases/:caseId/status", async (request) => {
    const { caseId } = request.params as { caseId: string };
    const payload = statusSchema.parse(request.body);
    return transitionCaseStatus(caseId, payload.status);
  });

  app.patch("/cases/:caseId/severity", async (request) => {
    const { caseId } = request.params as { caseId: string };
    const payload = severitySchema.parse(request.body);
    return setCaseSeverity(caseId, payload.severity, payload.justification);
  });
}

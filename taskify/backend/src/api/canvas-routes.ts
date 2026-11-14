import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createStatementSchema } from "../validation/schemas.js";
import { addStatement, listStatements, updateStatement } from "../services/canvas-service.js";
import { validateStatementClassification } from "../domain/epistemic-rules.js";

const updateSchema = z.object({
  epistemicType: z.enum(["hecho", "inferencia", "supuesto", "dato_faltante", "evaluacion_humana"]),
  sourceType: z.enum(["documental", "confirmado_por_persona", "sin_fuente"]),
  content: z.string().min(1).optional()
});

export async function registerCanvasRoutes(app: FastifyInstance): Promise<void> {
  app.post("/cases/:caseId/canvas/statements", async (request, reply) => {
    const { caseId } = request.params as { caseId: string };
    const payload = createStatementSchema.parse(request.body);
    validateStatementClassification({
      epistemicType: payload.epistemicType,
      sourceType: payload.sourceType ?? "sin_fuente"
    });

    const statement = addStatement(caseId, {
      dimensionType: payload.dimensionType,
      content: payload.content,
      epistemicType: payload.epistemicType,
      sourceType: payload.sourceType ?? "sin_fuente"
    });

    return reply.code(201).send(statement);
  });

  app.patch("/cases/:caseId/canvas/statements/:statementId", async (request) => {
    const { caseId, statementId } = request.params as { caseId: string; statementId: string };
    const payload = updateSchema.parse(request.body);
    validateStatementClassification(payload);
    return updateStatement(caseId, statementId, payload);
  });

  app.get("/cases/:caseId/canvas/statements", async (request) => {
    const { caseId } = request.params as { caseId: string };
    return listStatements(caseId);
  });
}

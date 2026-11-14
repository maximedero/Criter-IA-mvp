import { z } from "zod";

export const createCaseSchema = z.object({
  title: z.string().min(1).max(140),
  informalDescription: z.string().min(1)
});

export const createStatementSchema = z.object({
  dimensionType: z.enum([
    "contexto_senal",
    "exposicion",
    "evidencia",
    "impactos",
    "incertidumbres",
    "escenarios",
    "alternativas",
    "intervencion_requerida"
  ]),
  content: z.string().min(1),
  epistemicType: z.enum(["hecho", "inferencia", "supuesto", "dato_faltante", "evaluacion_humana"]),
  sourceType: z.enum(["documental", "confirmado_por_persona", "sin_fuente"]).optional()
});

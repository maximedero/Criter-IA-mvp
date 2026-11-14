export type CaseStatus =
  | "borrador"
  | "recopilando_evidencia"
  | "en_analisis"
  | "listo_para_revision"
  | "listo_para_elevar"
  | "elevado"
  | "cerrado";

export type Severity = "sin_evaluar" | "baja" | "media" | "alta" | "critica";

export type DimensionType =
  | "contexto_senal"
  | "exposicion"
  | "evidencia"
  | "impactos"
  | "incertidumbres"
  | "escenarios"
  | "alternativas"
  | "intervencion_requerida";

export type ValidationState =
  | "sugerido_ia"
  | "pendiente_revision"
  | "validado"
  | "rechazado"
  | "editado";

export interface DecisionCase {
  id: string;
  title: string;
  informalDescription: string;
  status: CaseStatus;
  severity: Severity;
  humanApprovedForElevation: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface Statement {
  id: string;
  caseId: string;
  dimensionType: DimensionType;
  content: string;
  epistemicType: "hecho" | "inferencia" | "supuesto" | "dato_faltante" | "evaluacion_humana";
  sourceType: "documental" | "confirmado_por_persona" | "sin_fuente";
  validationState: ValidationState;
  authorType: "humano" | "ia";
  createdAt: string;
  updatedAt: string;
}

export const dimensionOrder: DimensionType[] = [
  "contexto_senal",
  "exposicion",
  "evidencia",
  "impactos",
  "incertidumbres",
  "escenarios",
  "alternativas",
  "intervencion_requerida"
];
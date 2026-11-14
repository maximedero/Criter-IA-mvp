import { listStatements } from "./canvas-service.js";

export type ReviewFinding = {
  level: "bloqueo" | "advertencia" | "mejora";
  message: string;
};

export function runCriticalReview(caseId: string): ReviewFinding[] {
  const statements = listStatements(caseId);
  const findings: ReviewFinding[] = [];

  if (statements.length === 0) {
    findings.push({ level: "bloqueo", message: "El caso no tiene contenido en el canvas." });
  }

  if (statements.some((s) => s.epistemicType === "hecho" && s.sourceType === "sin_fuente")) {
    findings.push({ level: "advertencia", message: "Hay hechos sin fuente explícita." });
  }

  if (!statements.some((s) => s.dimensionType === "intervencion_requerida")) {
    findings.push({ level: "mejora", message: "Falta definir intervención requerida." });
  }

  return findings;
}

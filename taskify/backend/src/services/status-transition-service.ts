import { getCaseById, saveCase } from "./case-service.js";
import { listStatements } from "./canvas-service.js";
import { dimensionOrder, type CaseStatus } from "../domain/types.js";

export function canMoveToReadyForReview(caseId: string): boolean {
  const statements = listStatements(caseId);
  return dimensionOrder.every((d) => statements.some((s) => s.dimensionType === d));
}

export function canMoveToReadyForElevation(caseId: string): boolean {
  const item = getCaseById(caseId);
  if (!item || !item.humanApprovedForElevation) {
    return false;
  }

  const statements = listStatements(caseId);
  const required = ["evidencia", "incertidumbres", "alternativas", "intervencion_requerida"];
  return required.every((d) => statements.some((s) => s.dimensionType === d));
}

export function transitionCaseStatus(caseId: string, status: CaseStatus) {
  const item = getCaseById(caseId);
  if (!item) {
    throw new Error("Case not found");
  }

  if (status === "listo_para_revision" && !canMoveToReadyForReview(caseId)) {
    throw new Error("No cumple condiciones para listo_para_revision");
  }

  if (status === "listo_para_elevar" && !canMoveToReadyForElevation(caseId)) {
    throw new Error("No cumple condiciones para listo_para_elevar");
  }

  item.status = status;
  item.updatedAt = new Date().toISOString();
  saveCase(item);
  return item;
}

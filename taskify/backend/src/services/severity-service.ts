import { getCaseById, saveCase } from "./case-service.js";
import type { Severity } from "../domain/types.js";
import { writeAuditEvent } from "./audit-service.js";

export function setCaseSeverity(caseId: string, severity: Severity, justification?: string) {
  const item = getCaseById(caseId);
  if (!item) {
    throw new Error("Case not found");
  }

  item.severity = severity;
  item.updatedAt = new Date().toISOString();
  saveCase(item);
  writeAuditEvent({ eventType: "set_severity", caseId, actorType: "humano", payload: { severity, justification } });

  return item;
}

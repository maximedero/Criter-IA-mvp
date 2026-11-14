import { randomUUID } from "node:crypto";
import { listStatements } from "./canvas-service.js";
import { getCaseById, saveCase } from "./case-service.js";

type Brief = {
  id: string;
  caseId: string;
  content: string;
  approvedByHuman: boolean;
  readyToElevate: boolean;
  updatedAt: string;
};

const briefStore = new Map<string, Brief>();

export function generateBrief(caseId: string): Brief {
  const item = getCaseById(caseId);
  if (!item) {
    throw new Error("Case not found");
  }

  const statements = listStatements(caseId).filter((s) => s.validationState !== "rechazado");
  const content = statements.map((s) => `- [${s.dimensionType}] ${s.content}`).join("\n");

  const brief: Brief = {
    id: randomUUID(),
    caseId,
    content,
    approvedByHuman: false,
    readyToElevate: false,
    updatedAt: new Date().toISOString()
  };

  briefStore.set(brief.id, brief);
  return brief;
}

export function approveBrief(caseId: string, briefId: string): Brief {
  const item = getCaseById(caseId);
  const brief = briefStore.get(briefId);
  if (!item || !brief || brief.caseId !== caseId) {
    throw new Error("Brief not found");
  }

  brief.approvedByHuman = true;
  item.humanApprovedForElevation = true;
  item.updatedAt = new Date().toISOString();
  saveCase(item);

  return brief;
}

export function getBriefByCase(caseId: string): Brief | undefined {
  return Array.from(briefStore.values()).find((b) => b.caseId === caseId);
}

import { randomUUID } from "node:crypto";
import type { DecisionCase } from "../domain/types.js";

const casesStore = new Map<string, DecisionCase>();

export function createCase(input: { title: string; informalDescription: string }): DecisionCase {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 90);

  const item: DecisionCase = {
    id: randomUUID(),
    title: input.title,
    informalDescription: input.informalDescription,
    status: "borrador",
    severity: "sin_evaluar",
    humanApprovedForElevation: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  casesStore.set(item.id, item);
  return item;
}

export function listCases(): DecisionCase[] {
  return Array.from(casesStore.values());
}

export function getCaseById(caseId: string): DecisionCase | undefined {
  return casesStore.get(caseId);
}

export function saveCase(item: DecisionCase): DecisionCase {
  casesStore.set(item.id, item);
  return item;
}

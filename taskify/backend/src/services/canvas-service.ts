import { randomUUID } from "node:crypto";
import type { Statement } from "../domain/types.js";

const statementsByCase = new Map<string, Statement[]>();

export function addStatement(caseId: string, input: Omit<Statement, "id" | "caseId" | "createdAt" | "updatedAt" | "validationState" | "authorType">): Statement {
  const now = new Date().toISOString();
  const statement: Statement = {
    id: randomUUID(),
    caseId,
    dimensionType: input.dimensionType,
    content: input.content,
    epistemicType: input.epistemicType,
    sourceType: input.sourceType,
    validationState: "pendiente_revision",
    authorType: "humano",
    createdAt: now,
    updatedAt: now
  };

  const current = statementsByCase.get(caseId) ?? [];
  current.push(statement);
  statementsByCase.set(caseId, current);
  return statement;
}

export function listStatements(caseId: string): Statement[] {
  return statementsByCase.get(caseId) ?? [];
}

export function updateStatement(
  caseId: string,
  statementId: string,
  input: { epistemicType: Statement["epistemicType"]; sourceType: Statement["sourceType"]; content?: string }
): Statement {
  const current = statementsByCase.get(caseId) ?? [];
  const item = current.find((s) => s.id === statementId);

  if (!item) {
    throw new Error("Statement not found");
  }

  item.epistemicType = input.epistemicType;
  item.sourceType = input.sourceType;
  item.content = input.content ?? item.content;
  item.validationState = "editado";
  item.updatedAt = new Date().toISOString();

  return item;
}

import type { Statement } from "./types.js";

export function validateStatementClassification(statement: Pick<Statement, "epistemicType" | "sourceType">): void {
  if (statement.epistemicType === "hecho" && statement.sourceType === "sin_fuente") {
    throw new Error("Un hecho requiere fuente documental o confirmación humana.");
  }
}

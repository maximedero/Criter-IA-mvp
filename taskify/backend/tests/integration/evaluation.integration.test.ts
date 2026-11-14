import { describe, expect, it } from "vitest";
import { saveEvaluation, getEvaluation } from "../../src/services/evaluation-service.js";

describe("evaluation integration", () => {
  it("persists and retrieves scores", () => {
    saveEvaluation("case-1", { claridad_pedido: 4 });
    expect(getEvaluation("case-1")?.scores.claridad_pedido).toBe(4);
  });
});
import { describe, expect, it } from "vitest";
import { validateStatementClassification } from "../../src/domain/epistemic-rules.js";

describe("epistemic rules", () => {
  it("rejects fact without source", () => {
    expect(() =>
      validateStatementClassification({ epistemicType: "hecho", sourceType: "sin_fuente" })
    ).toThrow();
  });
});
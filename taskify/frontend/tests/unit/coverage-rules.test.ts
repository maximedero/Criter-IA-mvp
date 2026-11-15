import { describe, expect, it } from "vitest";
import type { CanvasItem } from "../../src/domain/models/CanvasItem";
import { evaluateMinimumCoverage } from "../../src/domain/rules/coverageRules";

function item(partial: Partial<CanvasItem>): CanvasItem {
  return {
    id: partial.id ?? "item-1",
    caseId: partial.caseId ?? "case-1",
    dimension: partial.dimension ?? "CONTEXT",
    content: partial.content ?? "contenido",
    epistemicType: partial.epistemicType ?? "FACT",
    origin: partial.origin ?? "USER",
    validationStatus: partial.validationStatus ?? "VALIDATED",
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString()
  };
}

describe("coverageRules", () => {
  it("USER + VALIDATED covers", () => {
    const result = evaluateMinimumCoverage([item({ dimension: "CONTEXT", origin: "USER", validationStatus: "VALIDATED" })]);
    expect(result.coveredDimensions).toContain("SITUATION");
  });

  it("USER + EDITED covers", () => {
    const result = evaluateMinimumCoverage([item({ dimension: "EXPOSURE", origin: "USER", validationStatus: "EDITED" })]);
    expect(result.coveredDimensions).toContain("EXPOSURE");
  });

  it("AI + PENDING does not cover", () => {
    const result = evaluateMinimumCoverage([item({ dimension: "IMPACT", origin: "AI", validationStatus: "PENDING" })]);
    expect(result.coveredDimensions).not.toContain("IMPACT");
  });

  it("AI + REJECTED does not cover", () => {
    const result = evaluateMinimumCoverage([item({ dimension: "EVIDENCE", origin: "AI", validationStatus: "REJECTED" })]);
    expect(result.coveredDimensions).not.toContain("EVIDENCE");
  });

  it("explicit human uncertainty declaration covers UNCERTAINTY", () => {
    const result = evaluateMinimumCoverage([
      item({
        dimension: "UNCERTAINTY",
        origin: "USER",
        validationStatus: "VALIDATED",
        epistemicType: "HUMAN_EVALUATION",
        content: "No identifico incertidumbres relevantes con la información disponible."
      })
    ]);

    expect(result.coveredDimensions).toContain("UNCERTAINTY");
  });

  it("six required dimensions present -> hasMinimumCoverage true", () => {
    const result = evaluateMinimumCoverage([
      item({ id: "1", dimension: "CONTEXT", validationStatus: "VALIDATED" }),
      item({ id: "2", dimension: "EXPOSURE", validationStatus: "VALIDATED" }),
      item({ id: "3", dimension: "IMPACT", validationStatus: "EDITED" }),
      item({ id: "4", dimension: "EVIDENCE", validationStatus: "VALIDATED" }),
      item({ id: "5", dimension: "UNCERTAINTY", validationStatus: "VALIDATED" }),
      item({ id: "6", dimension: "INTERVENTION", validationStatus: "VALIDATED" })
    ]);

    expect(result.coveredCount).toBe(6);
    expect(result.hasMinimumCoverage).toBe(true);
  });

  it("missing INTERVENTION -> hasMinimumCoverage false", () => {
    const result = evaluateMinimumCoverage([
      item({ id: "1", dimension: "CONTEXT", validationStatus: "VALIDATED" }),
      item({ id: "2", dimension: "EXPOSURE", validationStatus: "VALIDATED" }),
      item({ id: "3", dimension: "IMPACT", validationStatus: "VALIDATED" }),
      item({ id: "4", dimension: "EVIDENCE", validationStatus: "VALIDATED" }),
      item({ id: "5", dimension: "UNCERTAINTY", validationStatus: "VALIDATED" })
    ]);

    expect(result.hasMinimumCoverage).toBe(false);
    expect(result.missingDimensions).toContain("INTERVENTION");
  });

  it("SCENARIO and ALTERNATIVE do not change hasMinimumCoverage", () => {
    const result = evaluateMinimumCoverage([
      item({ id: "1", dimension: "SCENARIO", validationStatus: "VALIDATED" }),
      item({ id: "2", dimension: "ALTERNATIVE", validationStatus: "VALIDATED" })
    ]);

    expect(result.coveredCount).toBe(0);
    expect(result.hasMinimumCoverage).toBe(false);
  });
});

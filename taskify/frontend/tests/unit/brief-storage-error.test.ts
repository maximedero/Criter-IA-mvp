import { describe, expect, it, vi, afterEach } from "vitest";
import { saveCurrentBrief } from "../../src/providers/storage/briefStorage";

const brief = {
  id: "brief-1",
  caseId: "case-1",
  version: 1,
  status: "GENERATED",
  executive: {
    situation: { content: "c", sourceItemIds: [], hasSufficientInformation: false, limitations: ["x"] },
    whyItMatters: { content: "c", sourceItemIds: [], hasSufficientInformation: false, limitations: ["x"] },
    possibleImpacts: { content: "c", sourceItemIds: [], hasSufficientInformation: false, limitations: ["x"] },
    evidence: { content: "c", sourceItemIds: [], hasSufficientInformation: false, limitations: ["x"] },
    uncertainties: { content: "c", sourceItemIds: [], hasSufficientInformation: false, limitations: ["x"] },
    scenariosAndAlternatives: {
      content: "No identificados con la evidencia disponible.",
      sourceItemIds: [],
      hasSufficientInformation: false,
      limitations: ["x"]
    },
    severity: {
      value: "HIGH",
      label: "Alta",
      rationale: null,
      assessedBy: "USER",
      assessedAt: new Date().toISOString(),
      notice: "Evaluación realizada por el usuario."
    },
    requiredIntervention: { content: "c", sourceItemIds: [], hasSufficientInformation: false, limitations: ["x"] }
  },
  expanded: {
    facts: [],
    inferences: [],
    assumptions: [],
    missingInformation: [],
    humanEvaluations: [],
    evidenceItems: [],
    openWarnings: [],
    resolvedFindings: [],
    sources: [],
    generationLimitations: ["x"]
  },
  traceability: {
    sectionSources: {
      situation: [],
      whyItMatters: [],
      possibleImpacts: [],
      evidence: [],
      uncertainties: [],
      scenariosAndAlternatives: [],
      requiredIntervention: []
    },
    severityAssessmentRef: "s",
    criticalReviewId: "r",
    generatedFromCanvasUpdatedAt: new Date().toISOString(),
    generationProvider: "MockAIProvider",
    generationTimestamp: new Date().toISOString(),
    editedSections: []
  },
  generatedBy: "AI",
  reviewedByUser: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  reviewedAt: null
} as const;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("brief storage error", () => {
  it("throws when localStorage fails and caller can keep status unchanged", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage failure");
    });

    expect(() => saveCurrentBrief("case-1", brief)).toThrow();
    expect(setItem).toHaveBeenCalled();
  });
});

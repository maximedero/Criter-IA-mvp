import { describe, expect, it, vi, afterEach } from "vitest";
import { getBriefRecord, saveCurrentBrief, saveRegeneratedBrief } from "../../src/providers/storage/briefStorage.ts";

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
  communication: {
    email: {
      subject: "Asunto",
      body: "Cuerpo",
      editedByUser: false,
      updatedAt: new Date().toISOString()
    },
    message: {
      body: "Mensaje",
      editedByUser: false,
      updatedAt: new Date().toISOString()
    }
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

  it("normalizes legacy records without communication and stale", () => {
    const { communication: _currentCommunication, ...legacyCurrent } = brief;
    const { communication: _historyCommunication, ...legacyHistory } = { ...brief, id: "brief-old" };

    localStorage.setItem(
      "dw.briefs",
      JSON.stringify({
        "case-legacy": {
          current: legacyCurrent,
          history: [legacyHistory]
        }
      })
    );

    const record = getBriefRecord("case-legacy");

    expect(record.stale).toBe(false);
    expect(record.current?.communication.email.subject).toBe("");
    expect(record.current?.communication.message.body).toBe("");
    expect(record.history[0]?.communication.email.updatedAt).toBeTruthy();
  });

  it("stores regenerated brief as current and keeps previous in history", () => {
    const current = { ...brief, id: "brief-current", version: 1 };
    saveCurrentBrief("case-version", current);

    const regenerated = { ...brief, id: "brief-regenerated", version: 2 };
    const record = saveRegeneratedBrief("case-version", regenerated);

    expect(record.current?.id).toBe("brief-regenerated");
    expect(record.history[record.history.length - 1]?.id).toBe("brief-current");
    expect(record.stale).toBe(false);
  });
});

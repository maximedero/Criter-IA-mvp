import { describe, expect, it } from "vitest";
import { createPersistedQuestion, inferQuestionStatus, mapDontKnowTemplate } from "../../src/domain/workflow/questionLoop";

describe("questionLoop", () => {
  it("creates persisted active question", () => {
    const persisted = createPersistedQuestion("case-1", {
      id: "q-1",
      targetDimension: "IMPACT",
      question: "¿Qué impacto?",
      reason: "Necesitamos impacto",
      priority: "HIGH",
      suggestedEpistemicType: "INFERENCE",
      answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
    });

    expect(persisted.status).toBe("ACTIVE");
    expect(persisted.caseId).toBe("case-1");
  });

  it("maps dont know templates by target dimension", () => {
    expect(mapDontKnowTemplate("IMPACT")).toContain("No conocemos qué trabajos concretos");
    expect(mapDontKnowTemplate("EVIDENCE")).toContain("No contamos con información suficiente");
    expect(mapDontKnowTemplate("UNCERTAINTY")).toContain("No se identificó todavía");
    expect(mapDontKnowTemplate("INTERVENTION")).toContain("No está definido qué intervención");
  });

  it("maps answer actions to question statuses", () => {
    expect(inferQuestionStatus("ANSWER")).toBe("ANSWERED");
    expect(inferQuestionStatus("DONT_KNOW")).toBe("DONT_KNOW");
    expect(inferQuestionStatus("NOT_APPLICABLE")).toBe("NOT_APPLICABLE");
    expect(inferQuestionStatus("SKIP_FOR_NOW")).toBe("SKIPPED");
  });
});

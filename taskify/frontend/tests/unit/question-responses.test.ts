import { beforeEach, describe, expect, it } from "vitest";
import { evaluateMinimumCoverage } from "../../src/domain/rules/coverageRules";
import {
  answerActiveQuestion,
  declareNoRelevantUncertainty
} from "../../src/domain/workflow/questionResponses";
import { createPersistedQuestion } from "../../src/domain/workflow/questionLoop";
import { clearAiQuestionSessionsForTests, getAiQuestionSession, setActiveQuestion } from "../../src/providers/storage/aiSessionStorage";
import { clearCanvasForTests, listCanvasItemsByCase } from "../../src/providers/storage/canvasStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const CASE_ID = "case-1";

describe("questionResponses", () => {
  beforeEach(() => {
    clearWorkspaceStorage();
    clearCanvasForTests();
    clearAiQuestionSessionsForTests();
  });

  it("only one ACTIVE question can exist", () => {
    const q1 = createPersistedQuestion(CASE_ID, {
      id: "q1",
      targetDimension: "IMPACT",
      question: "q1",
      reason: "r",
      priority: "HIGH",
      suggestedEpistemicType: "INFERENCE",
      answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
    });

    const q2 = createPersistedQuestion(CASE_ID, {
      id: "q2",
      targetDimension: "EVIDENCE",
      question: "q2",
      reason: "r",
      priority: "HIGH",
      suggestedEpistemicType: "FACT",
      answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
    });

    setActiveQuestion(CASE_ID, q1);
    setActiveQuestion(CASE_ID, q2);

    const session = getAiQuestionSession(CASE_ID);
    expect(session.questions.filter((item) => item.status === "ACTIVE")).toHaveLength(1);
  });

  it("normal answer creates USER/VALIDATED on target dimension and suggested epistemic type", () => {
    setActiveQuestion(
      CASE_ID,
      createPersistedQuestion(CASE_ID, {
        id: "q-impact",
        targetDimension: "IMPACT",
        question: "impact?",
        reason: "r",
        priority: "HIGH",
        suggestedEpistemicType: "INFERENCE",
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
      })
    );

    const answerText = "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.";
    const result = answerActiveQuestion(CASE_ID, { action: "ANSWER", answerText });

    expect(result.createdItem?.origin).toBe("USER");
    expect(result.createdItem?.validationStatus).toBe("VALIDATED");
    expect(result.createdItem?.dimension).toBe("IMPACT");
    expect(result.createdItem?.epistemicType).toBe("INFERENCE");
    expect(result.createdItem?.content).toBe(answerText);
  });

  it("dont know creates uncertainty missing information and does not cover original target", () => {
    setActiveQuestion(
      CASE_ID,
      createPersistedQuestion(CASE_ID, {
        id: "q-evidence",
        targetDimension: "EVIDENCE",
        question: "evidence?",
        reason: "r",
        priority: "HIGH",
        suggestedEpistemicType: "FACT",
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
      })
    );

    const result = answerActiveQuestion(CASE_ID, { action: "DONT_KNOW" });

    expect(result.createdItem?.dimension).toBe("UNCERTAINTY");
    expect(result.createdItem?.epistemicType).toBe("MISSING_INFORMATION");
    expect(result.createdItem?.content).toContain("No contamos con información suficiente");

    const coverage = evaluateMinimumCoverage(listCanvasItemsByCase(CASE_ID));
    expect(coverage.coveredDimensions).not.toContain("EVIDENCE");
  });

  it("skip does not create canvas item and does not modify coverage", () => {
    setActiveQuestion(
      CASE_ID,
      createPersistedQuestion(CASE_ID, {
        id: "q-impact",
        targetDimension: "IMPACT",
        question: "impact?",
        reason: "r",
        priority: "HIGH",
        suggestedEpistemicType: "INFERENCE",
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
      })
    );

    const before = evaluateMinimumCoverage(listCanvasItemsByCase(CASE_ID));
    const result = answerActiveQuestion(CASE_ID, { action: "SKIP_FOR_NOW" });
    const after = evaluateMinimumCoverage(listCanvasItemsByCase(CASE_ID));

    expect(result.createdItem).toBeNull();
    expect(after.coveredCount).toBe(before.coveredCount);
  });

  it("not applicable is blocked when option is not allowed", () => {
    setActiveQuestion(
      CASE_ID,
      createPersistedQuestion(CASE_ID, {
        id: "q-impact",
        targetDimension: "IMPACT",
        question: "impact?",
        reason: "r",
        priority: "HIGH",
        suggestedEpistemicType: "INFERENCE",
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
      })
    );

    expect(() => answerActiveQuestion(CASE_ID, { action: "NOT_APPLICABLE" })).toThrow();
  });

  it("declaring no relevant uncertainties creates HUMAN_EVALUATION and satisfies uncertainty", () => {
    const created = declareNoRelevantUncertainty(CASE_ID);

    expect(created.dimension).toBe("UNCERTAINTY");
    expect(created.epistemicType).toBe("HUMAN_EVALUATION");

    const coverage = evaluateMinimumCoverage(listCanvasItemsByCase(CASE_ID));
    expect(coverage.coveredDimensions).toContain("UNCERTAINTY");
  });

  it("empty answer is rejected", () => {
    setActiveQuestion(
      CASE_ID,
      createPersistedQuestion(CASE_ID, {
        id: "q-impact",
        targetDimension: "IMPACT",
        question: "impact?",
        reason: "r",
        priority: "HIGH",
        suggestedEpistemicType: "INFERENCE",
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
      })
    );

    expect(() => answerActiveQuestion(CASE_ID, { action: "ANSWER", answerText: "   " })).toThrow();
  });

  it("rationale is not written into evidence content", () => {
    setActiveQuestion(
      CASE_ID,
      createPersistedQuestion(CASE_ID, {
        id: "q-evidence",
        targetDimension: "EVIDENCE",
        question: "evidence?",
        reason: "Esto permite distinguir una consecuencia plausible de una afirmación respaldada",
        priority: "HIGH",
        suggestedEpistemicType: "FACT",
        answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
      })
    );

    const result = answerActiveQuestion(CASE_ID, {
      action: "ANSWER",
      answerText: "Existe un correo formal de continuidad temporal firmado por el área usuaria."
    });

    expect(result.createdItem?.content).toBe("Existe un correo formal de continuidad temporal firmado por el área usuaria.");
    expect(result.createdItem?.content).not.toContain("Esto permite distinguir");
  });
});

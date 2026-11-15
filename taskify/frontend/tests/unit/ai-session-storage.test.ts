import { beforeEach, describe, expect, it } from "vitest";
import { clearAiQuestionSessionsForTests, findActiveQuestion, getAiQuestionSession, markUserStopped, setActiveQuestion, setStopResult, updateQuestionStatus } from "../../src/providers/storage/aiSessionStorage";
import { createPersistedQuestion } from "../../src/domain/workflow/questionLoop";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const CASE_ID = "case-1";

describe("aiSessionStorage", () => {
  beforeEach(() => {
    clearWorkspaceStorage();
    clearAiQuestionSessionsForTests();
  });

  it("persists active question and prevents duplicates", () => {
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
    expect(session.questions).toHaveLength(1);
    expect(session.questionCount).toBe(1);
    expect(findActiveQuestion(CASE_ID)?.id).toBe("q1");
  });

  it("updates question status and links resulting item", () => {
    const q1 = createPersistedQuestion(CASE_ID, {
      id: "q1",
      targetDimension: "IMPACT",
      question: "q1",
      reason: "r",
      priority: "HIGH",
      suggestedEpistemicType: "INFERENCE",
      answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
    });

    setActiveQuestion(CASE_ID, q1);
    const updated = updateQuestionStatus(CASE_ID, "q1", "ANSWERED", "item-1");

    expect(updated.status).toBe("ANSWERED");
    expect(updated.resultingCanvasItemId).toBe("item-1");
  });

  it("persists user stopped as stop reason", () => {
    markUserStopped(CASE_ID);

    const session = getAiQuestionSession(CASE_ID);
    expect(session.userStopped).toBe(true);
    expect(session.lastStop?.stopReason).toBe("USER_STOPPED");
  });

  it("stores stop result", () => {
    setStopResult(CASE_ID, {
      question: null,
      shouldStop: true,
      stopReason: "EXTERNAL_RESEARCH_REQUIRED",
      remainingMissingDimensions: ["EVIDENCE"],
      provisionalBriefAllowed: false,
      message: "Requiere investigación externa"
    });

    const session = getAiQuestionSession(CASE_ID);
    expect(session.lastStop?.stopReason).toBe("EXTERNAL_RESEARCH_REQUIRED");
  });

  it("reload keeps active question without duplication", () => {
    const q1 = createPersistedQuestion(CASE_ID, {
      id: "q1",
      targetDimension: "IMPACT",
      question: "q1",
      reason: "r",
      priority: "HIGH",
      suggestedEpistemicType: "INFERENCE",
      answerOptions: ["ANSWER", "DONT_KNOW", "SKIP_FOR_NOW"]
    });

    setActiveQuestion(CASE_ID, q1);
    const afterReload = getAiQuestionSession(CASE_ID);

    expect(afterReload.questions.filter((q) => q.status === "ACTIVE")).toHaveLength(1);
  });
});

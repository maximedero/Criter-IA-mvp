import { describe, expect, it } from "vitest";
import { getNextQuestion } from "../../src/services/ai-assist-service.js";

describe("AI questions integration", () => {
  it("enforces 5-question maximum", async () => {
    const caseId = "case-1";

    for (let i = 0; i < 5; i += 1) {
      const response = await getNextQuestion(caseId);
      expect(response.questionCount).toBe(i + 1);
    }

    const capped = await getNextQuestion(caseId);
    expect(capped.maxQuestionsReached).toBe(true);
    expect(capped.question).toBeNull();
  });
});
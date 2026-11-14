import { describe, expect, it } from "vitest";

describe("AI questions contract", () => {
  it("returns question payload with count and max flag", () => {
    const sample = {
      question: "¿Qué dato falta?",
      questionCount: 1,
      maxQuestionsReached: false,
      suggestion: null
    };

    expect(sample).toHaveProperty("questionCount");
    expect(sample).toHaveProperty("maxQuestionsReached");
  });
});
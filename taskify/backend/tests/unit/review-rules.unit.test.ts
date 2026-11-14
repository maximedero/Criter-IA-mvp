import { describe, expect, it } from "vitest";
import { runCriticalReview } from "../../src/services/review-service.js";

describe("review rules", () => {
  it("returns blocking finding when case is empty", () => {
    const findings = runCriticalReview("missing-case");
    expect(findings.length).toBeGreaterThan(0);
  });
});
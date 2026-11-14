import { describe, expect, it } from "vitest";
import { purgeExpiredCases } from "../../src/services/retention-service.js";

describe("retention integration", () => {
  it("purges cases older than 90 days", () => {
    const old = [{ id: "1", title: "a", informalDescription: "b", status: "borrador", severity: "sin_evaluar", humanApprovedForElevation: false, createdAt: "2020-01-01T00:00:00.000Z", updatedAt: "2020-01-01T00:00:00.000Z", expiresAt: "2020-04-01T00:00:00.000Z" } as any];
    expect(purgeExpiredCases(old).length).toBe(0);
  });
});
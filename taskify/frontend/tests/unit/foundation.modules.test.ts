import { describe, expect, it } from "vitest";

describe("foundation modules", () => {
  it("loads foundational modules", async () => {
    const domain = await import("../../src/domain/index");
    const ai = await import("../../src/providers/ai/index");
    const storage = await import("../../src/providers/storage/index");
    const validation = await import("../../src/validation/index");

    expect(domain).toBeDefined();
    expect(ai).toBeDefined();
    expect(storage).toBeDefined();
    expect(validation).toBeDefined();
  });
});

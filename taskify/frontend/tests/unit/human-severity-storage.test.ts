import { beforeEach, describe, expect, it, vi } from "vitest";
import { HUMAN_SEVERITIES } from "../../src/domain/models/CaseStatus";
import { clearHumanSeverityAssessmentsForTests, getHumanSeverityAssessment, saveHumanSeverityAssessment } from "../../src/providers/storage/humanSeverityStorage";

describe("humanSeverityStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    clearHumanSeverityAssessmentsForTests();
  });

  it("enum contains exactly five severities", () => {
    expect(HUMAN_SEVERITIES).toEqual(["UNASSESSED", "LOW", "MEDIUM", "HIGH", "CRITICAL"]);
  });

  it("new assessment starts UNASSESSED with USER and null assessedAt", () => {
    const assessment = getHumanSeverityAssessment("case-1");

    expect(assessment.caseId).toBe("case-1");
    expect(assessment.severity).toBe("UNASSESSED");
    expect(assessment.status).toBe("UNASSESSED");
    expect(assessment.assessedBy).toBe("USER");
    expect(assessment.assessedAt).toBeNull();
  });

  it("saving LOW marks ASSESSED and sets assessedAt", () => {
    const saved = saveHumanSeverityAssessment({ caseId: "case-1", severity: "LOW" });

    expect(saved.status).toBe("ASSESSED");
    expect(saved.assessedBy).toBe("USER");
    expect(saved.assessedAt).not.toBeNull();
  });

  it("saving MEDIUM/HIGH/CRITICAL marks ASSESSED", () => {
    expect(saveHumanSeverityAssessment({ caseId: "case-a", severity: "MEDIUM" }).status).toBe("ASSESSED");
    expect(saveHumanSeverityAssessment({ caseId: "case-b", severity: "HIGH" }).status).toBe("ASSESSED");
    expect(saveHumanSeverityAssessment({ caseId: "case-c", severity: "CRITICAL" }).status).toBe("ASSESSED");
  });

  it("updatedAt changes after modification", async () => {
    const first = saveHumanSeverityAssessment({ caseId: "case-1", severity: "LOW" });
    await new Promise((resolve) => setTimeout(resolve, 2));
    const second = saveHumanSeverityAssessment({ caseId: "case-1", severity: "HIGH" });

    expect(new Date(second.updatedAt).getTime()).toBeGreaterThan(new Date(first.updatedAt).getTime());
  });

  it("keeps exact rationale text and persists across reload", () => {
    const rationale =
      "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto.";

    saveHumanSeverityAssessment({ caseId: "case-1", severity: "HIGH", rationale });

    const reloaded = getHumanSeverityAssessment("case-1");
    expect(reloaded.rationale).toBe(rationale);
    expect(reloaded.severity).toBe("HIGH");
    expect(reloaded.assessedBy).toBe("USER");
  });

  it("reverting to UNASSESSED clears assessedAt and preserves rationale", () => {
    saveHumanSeverityAssessment({ caseId: "case-1", severity: "HIGH", rationale: "texto humano" });

    const saved = saveHumanSeverityAssessment({ caseId: "case-1", severity: "UNASSESSED" });

    expect(saved.severity).toBe("UNASSESSED");
    expect(saved.status).toBe("UNASSESSED");
    expect(saved.assessedAt).toBeNull();
    expect(saved.rationale).toBe("texto humano");
  });

  it("storage failure bubbles up and keeps previous persisted value", () => {
    saveHumanSeverityAssessment({ caseId: "case-1", severity: "LOW" });

    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage failure");
    });

    expect(() => saveHumanSeverityAssessment({ caseId: "case-1", severity: "HIGH" })).toThrow();

    setItemSpy.mockRestore();

    const reloaded = getHumanSeverityAssessment("case-1");
    expect(reloaded.severity).toBe("LOW");
  });
});

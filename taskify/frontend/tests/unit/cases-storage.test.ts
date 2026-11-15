import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDecisionCasesForTests,
  createDecisionCase,
  getDecisionCaseById,
  listDecisionCases
} from "../../src/providers/storage/casesStorage";
import { RETENTION_MS } from "../../src/domain/rules/retentionRules";
import { clearWorkspaceStorage } from "../setup/test-helpers";

describe("casesStorage", () => {
  beforeEach(() => {
    clearWorkspaceStorage();
  });

  it("saves case", () => {
    const item = createDecisionCase({
      title: "Contrato Dynamics 365",
      initialNarrative: "Relato inicial"
    });

    expect(item.id).toBeTruthy();
    expect(item.status).toBe("BORRADOR");
  });

  it("lists cases", () => {
    createDecisionCase({ title: "A", initialNarrative: "Relato A" });
    createDecisionCase({ title: "B", initialNarrative: "Relato B" });

    const items = listDecisionCases();
    expect(items).toHaveLength(2);
    expect(items[0]?.title).toBe("B");
    expect(items[1]?.title).toBe("A");
  });

  it("gets case by id", () => {
    const created = createDecisionCase({ title: "A", initialNarrative: "Relato A" });

    const loaded = getDecisionCaseById(created.id);
    expect(loaded?.title).toBe("A");
    expect(loaded?.initialNarrative).toBe("Relato A");
  });

  it("persists in localStorage", () => {
    const created = createDecisionCase({ title: "Persistente", initialNarrative: "Persistencia" });

    const loaded = getDecisionCaseById(created.id);
    expect(loaded).not.toBeNull();
  });

  it("purges expired cases on list", () => {
    const fixedNow = new Date("2026-11-15T00:00:00.000Z").getTime();
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);

    createDecisionCase({ title: "A", initialNarrative: "Relato" });

    const raw = localStorage.getItem("dw.cases");
    expect(raw).toBeTruthy();

    vi.setSystemTime(fixedNow + RETENTION_MS + 1);

    const list = listDecisionCases();
    expect(list).toHaveLength(0);

    vi.useRealTimers();
  });

  it("validates trim title and narrative", () => {
    expect(() => createDecisionCase({ title: "   ", initialNarrative: "ok" })).toThrow("title is required");
    expect(() => createDecisionCase({ title: "ok", initialNarrative: "   " })).toThrow("initialNarrative is required");
  });

  it("clear helper removes data", () => {
    createDecisionCase({ title: "A", initialNarrative: "Relato" });
    clearDecisionCasesForTests();

    expect(listDecisionCases()).toHaveLength(0);
  });
});

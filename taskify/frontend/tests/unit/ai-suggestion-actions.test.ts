import { beforeEach, describe, expect, it } from "vitest";
import { evaluateMinimumCoverage } from "../../src/domain/rules/coverageRules";
import {
  acceptAISuggestion,
  applyAnalyzeNarrativeSuggestions,
  editAISuggestion,
  rejectAISuggestion
} from "../../src/features/canvas/aiSuggestionActions";
import { listCanvasItemsByCase } from "../../src/providers/storage/canvasStorage";
import { clearCanvasForTests } from "../../src/providers/storage/canvasStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const CASE_ID = "case-1";

const BASE_SUGGESTIONS = [
  {
    id: "dw-ai-dynamics-1",
    dimension: "CONTEXT" as const,
    epistemicType: "FACT" as const,
    content: "El contrato con el proveedor venció el 31/10/2026.",
    rationale: "El relato presenta explícitamente el vencimiento y su fecha.",
    source: "INITIAL_NARRATIVE" as const
  },
  {
    id: "dw-ai-dynamics-2",
    dimension: "CONTEXT" as const,
    epistemicType: "FACT" as const,
    content: "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.",
    rationale: "El relato describe explícitamente una condición transitoria posterior al vencimiento.",
    source: "INITIAL_NARRATIVE" as const
  },
  {
    id: "dw-ai-dynamics-3",
    dimension: "EXPOSURE" as const,
    epistemicType: "FACT" as const,
    content: "Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
    rationale: "El relato expresa una restricción operativa vigente.",
    source: "INITIAL_NARRATIVE" as const
  }
];

describe("aiSuggestionActions", () => {
  beforeEach(() => {
    clearWorkspaceStorage();
    clearCanvasForTests();
  });

  it("creates CanvasItems with origin AI and PENDING status", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);

    const items = listCanvasItemsByCase(CASE_ID);
    expect(items).toHaveLength(1);
    expect(items[0]?.origin).toBe("AI");
    expect(items[0]?.validationStatus).toBe("PENDING");
  });

  it("AI/PENDING does not satisfy coverage", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);

    const coverage = evaluateMinimumCoverage(listCanvasItemsByCase(CASE_ID));
    expect(coverage.coveredCount).toBe(0);
    expect(coverage.hasMinimumCoverage).toBe(false);
  });

  it("accept changes PENDING to VALIDATED", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);
    const item = listCanvasItemsByCase(CASE_ID)[0];

    acceptAISuggestion(CASE_ID, item.id);

    const updated = listCanvasItemsByCase(CASE_ID)[0];
    expect(updated.validationStatus).toBe("VALIDATED");
  });

  it("edit changes PENDING to EDITED", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);
    const item = listCanvasItemsByCase(CASE_ID)[0];

    editAISuggestion(CASE_ID, item.id, "Contenido editado por usuario");

    const updated = listCanvasItemsByCase(CASE_ID)[0];
    expect(updated.validationStatus).toBe("EDITED");
  });

  it("edit preserves exact user-defined content", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);
    const item = listCanvasItemsByCase(CASE_ID)[0];
    const edited = "El proveedor continúa únicamente hasta finalizar el proyecto actual.";

    editAISuggestion(CASE_ID, item.id, edited);

    const updated = listCanvasItemsByCase(CASE_ID)[0];
    expect(updated.content).toBe(edited);
  });

  it("reject changes PENDING to REJECTED", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);
    const item = listCanvasItemsByCase(CASE_ID)[0];

    rejectAISuggestion(CASE_ID, item.id);

    const updated = listCanvasItemsByCase(CASE_ID)[0];
    expect(updated.validationStatus).toBe("REJECTED");
  });

  it("REJECTED does not satisfy coverage", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);
    const item = listCanvasItemsByCase(CASE_ID)[0];

    rejectAISuggestion(CASE_ID, item.id);

    const coverage = evaluateMinimumCoverage(listCanvasItemsByCase(CASE_ID));
    expect(coverage.coveredCount).toBe(0);
  });

  it("reanalysis does not duplicate equivalent active suggestions", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, BASE_SUGGESTIONS);
    applyAnalyzeNarrativeSuggestions(CASE_ID, BASE_SUGGESTIONS);

    expect(listCanvasItemsByCase(CASE_ID)).toHaveLength(3);
  });

  it("reanalysis does not reactivate REJECTED suggestions", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);
    const item = listCanvasItemsByCase(CASE_ID)[0];
    rejectAISuggestion(CASE_ID, item.id);

    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);

    const items = listCanvasItemsByCase(CASE_ID);
    expect(items).toHaveLength(1);
    expect(items[0]?.validationStatus).toBe("REJECTED");
  });

  it("reanalysis does not overwrite EDITED content", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);
    const item = listCanvasItemsByCase(CASE_ID)[0];
    const edited = "Contenido final definido por el usuario";

    editAISuggestion(CASE_ID, item.id, edited);
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);

    const items = listCanvasItemsByCase(CASE_ID);
    expect(items).toHaveLength(1);
    expect(items[0]?.content).toBe(edited);
    expect(items[0]?.validationStatus).toBe("EDITED");
  });

  it("rationale is stored as metadata and not as evidence content", () => {
    applyAnalyzeNarrativeSuggestions(CASE_ID, [BASE_SUGGESTIONS[0]]);

    const item = listCanvasItemsByCase(CASE_ID)[0];
    expect(item.aiSuggestion?.rationale).toBe("El relato presenta explícitamente el vencimiento y su fecha.");
    expect(item.content).not.toContain("Por qué se sugiere");
  });
});

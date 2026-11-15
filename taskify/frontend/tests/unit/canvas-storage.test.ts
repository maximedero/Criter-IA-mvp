import { beforeEach, describe, expect, it } from "vitest";
import {
  CANVAS_DIMENSIONS,
  EPISTEMIC_TYPES,
  isValidCanvasDimension,
  isValidEpistemicType
} from "../../src/domain/models/CanvasItem";
import {
  clearCanvasForTests,
  createCanvasItem,
  deleteCanvasItem,
  listCanvasItemsByCase,
  updateCanvasItem
} from "../../src/providers/storage/canvasStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

describe("canvasStorage", () => {
  const caseId = "case-1";

  beforeEach(() => {
    clearWorkspaceStorage();
    clearCanvasForTests();
  });

  it("accepts only valid dimensions", () => {
    for (const dimension of CANVAS_DIMENSIONS) {
      expect(isValidCanvasDimension(dimension)).toBe(true);
    }

    expect(isValidCanvasDimension("OTHER")).toBe(false);
  });

  it("accepts only valid epistemic types", () => {
    for (const epistemicType of EPISTEMIC_TYPES) {
      expect(isValidEpistemicType(epistemicType)).toBe(true);
    }

    expect(isValidEpistemicType("OTHER")).toBe(false);
  });

  it("creates canvas item", () => {
    const created = createCanvasItem({
      caseId,
      dimension: "CONTEXT",
      content: "El contrato con el proveedor venció el 31/10/2026.",
      epistemicType: "FACT"
    });

    expect(created.origin).toBe("USER");
    expect(created.validationStatus).toBe("VALIDATED");

    const list = listCanvasItemsByCase(caseId);
    expect(list).toHaveLength(1);
    expect(list[0]?.content).toBe("El contrato con el proveedor venció el 31/10/2026.");
  });

  it("edits canvas item", () => {
    const created = createCanvasItem({
      caseId,
      dimension: "UNCERTAINTY",
      content: "No conocemos cuándo termina exactamente el proyecto actual.",
      epistemicType: "MISSING_INFORMATION"
    });

    const updated = updateCanvasItem(caseId, created.id, {
      content: "No conocemos la fecha exacta de finalización del proyecto actual.",
      epistemicType: "MISSING_INFORMATION"
    });

    expect(updated.validationStatus).toBe("EDITED");

    const list = listCanvasItemsByCase(caseId);
    expect(list[0]?.content).toBe("No conocemos la fecha exacta de finalización del proyecto actual.");
  });

  it("deletes canvas item", () => {
    const created = createCanvasItem({
      caseId,
      dimension: "IMPACT",
      content: "No podemos iniciar nuevas tareas.",
      epistemicType: "INFERENCE"
    });

    deleteCanvasItem(caseId, created.id);

    expect(listCanvasItemsByCase(caseId)).toHaveLength(0);
  });

  it("persists items in localStorage", () => {
    createCanvasItem({
      caseId,
      dimension: "ALTERNATIVE",
      content: "Renegociar contrato temporal.",
      epistemicType: "ASSUMPTION"
    });

    const raw = localStorage.getItem("dw.canvas");
    expect(raw).toBeTruthy();

    const list = listCanvasItemsByCase(caseId);
    expect(list).toHaveLength(1);
  });
});

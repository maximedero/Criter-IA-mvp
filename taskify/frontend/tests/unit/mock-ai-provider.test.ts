import { describe, expect, it } from "vitest";
import type { AnalyzeNarrativeResult } from "../../src/providers/ai";
import { MockAIProvider } from "../../src/providers/ai";
import { parseAnalyzeNarrativeResult } from "../../src/providers/ai/aiParsing";

const DYNAMICS_NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

describe("MockAIProvider", () => {
  it("returns exactly three suggestions for Dynamics narrative", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: DYNAMICS_NARRATIVE,
      existingItems: []
    });

    expect(result.suggestions).toHaveLength(3);
  });

  it("keeps deterministic order of Dynamics suggestions", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: DYNAMICS_NARRATIVE,
      existingItems: []
    });

    expect(result.suggestions.map((item) => item.id)).toEqual([
      "dw-ai-dynamics-1",
      "dw-ai-dynamics-2",
      "dw-ai-dynamics-3"
    ]);
  });

  it("validates Dynamics output with Zod", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: DYNAMICS_NARRATIVE,
      existingItems: []
    });

    expect(() => parseAnalyzeNarrativeResult(result)).not.toThrow();
  });

  it("fails explicitly on invalid output", () => {
    const invalidResult: AnalyzeNarrativeResult = {
      suggestions: [
        {
          id: "bad",
          dimension: "CONTEXT",
          epistemicType: "FACT",
          content: "dato",
          rationale: "x",
          source: "INITIAL_NARRATIVE"
        }
      ]
    };

    expect(() =>
      parseAnalyzeNarrativeResult({
        ...invalidResult,
        suggestions: [{ ...invalidResult.suggestions[0], dimension: "NOT_A_DIMENSION" }]
      })
    ).toThrow();
  });

  it("returns empty suggestions for unrecognized narrative", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: "Relato no reconocido por fixture",
      existingItems: []
    });

    expect(result.suggestions).toHaveLength(0);
  });

  it("applies epistemic prudence: future possibility is not FACT", async () => {
    const provider = new MockAIProvider();

    const result = await provider.analyzeNarrative({
      caseId: "case-1",
      initialNarrative: "Si termina el proveedor seguramente no podremos mantener las aplicaciones.",
      existingItems: []
    });

    expect(result.suggestions).toEqual([]);
    expect(result.suggestions.some((item) => item.epistemicType === "FACT")).toBe(false);
  });
});

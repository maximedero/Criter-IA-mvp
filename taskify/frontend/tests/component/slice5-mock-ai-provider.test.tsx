import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { AIProvider, AnalyzeNarrativeInput, AnalyzeNarrativeResult } from "../../src/providers/ai";
import { App } from "../../src/app/App";
import { clearCanvasForTests, listCanvasItemsByCase } from "../../src/providers/storage/canvasStorage";
import { clearDecisionCasesForTests, listDecisionCases } from "../../src/providers/storage/casesStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const NARRATIVE =
  "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.";

function openCaseDetail(aiProvider?: AIProvider, title = `Contrato Dynamics 365 ${Date.now()}`) {
  render(<App aiProvider={aiProvider} />);

  fireEvent.click(screen.getByRole("button", { name: "Nuevo caso" }));
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: title } });
  fireEvent.change(screen.getByLabelText("¿Qué está pasando?"), { target: { value: NARRATIVE } });
  fireEvent.click(screen.getByRole("button", { name: "Crear caso" }));
  fireEvent.click(screen.getAllByRole("button", { name: "Abrir" })[0]);
}

function makeInvalidProvider(): AIProvider {
  return {
    analyzeNarrative: async (_input: AnalyzeNarrativeInput): Promise<AnalyzeNarrativeResult> => ({
      suggestions: [
        {
          id: "invalid",
          dimension: "NOT_VALID" as never,
          epistemicType: "FACT",
          content: "Contenido inválido",
          rationale: "Rationale inválido",
          source: "INITIAL_NARRATIVE"
        }
      ]
    }),
    suggestNextQuestion: async () => ({ suggestedQuestion: null }),
    reviewCase: async () => ({ findings: [] }),
    generateBrief: async () => ({ executiveSummary: "", expandedSummary: "" })
  };
}

describe.sequential("Slice5 MockAIProvider integration", () => {
  beforeEach(() => {
    cleanup();
    clearWorkspaceStorage();
    clearDecisionCasesForTests();
    clearCanvasForTests();
  });

  it("shows Analizar relato action", () => {
    openCaseDetail();

    expect(screen.getByRole("button", { name: "Analizar relato" })).toBeInTheDocument();
  });

  it("does not trigger analysis automatically on open", () => {
    openCaseDetail();

    expect(screen.queryByText("Sugerido por IA")).not.toBeInTheDocument();
  });

  it("clicking analyzes narrative and shows three suggestions", async () => {
    openCaseDetail();

    fireEvent.click(screen.getByRole("button", { name: "Analizar relato" }));

    await waitFor(() => {
      expect(screen.getAllByText("Sugerido por IA")).toHaveLength(3);
    });

    expect(screen.getAllByText("Hecho").length).toBeGreaterThan(0);
    expect(screen.getByText("El contrato con el proveedor venció el 31/10/2026.")).toBeInTheDocument();
    expect(screen.getAllByText(/Por qué se sugiere:/)).toHaveLength(3);
    expect(screen.getAllByText("Origen de la sugerencia: relato inicial.")).toHaveLength(3);
  });

  it("accept works and removes pending actions", async () => {
    openCaseDetail();

    fireEvent.click(screen.getByRole("button", { name: "Analizar relato" }));
    await waitFor(() => expect(screen.getAllByText("Sugerido por IA")).toHaveLength(3));

    const contextSection = screen.getByRole("heading", { name: "Contexto y señal" }).closest("section");
    expect(contextSection).not.toBeNull();

    fireEvent.click(within(contextSection as HTMLElement).getAllByRole("button", { name: "Aceptar" })[0]);

    await waitFor(() => {
      expect(screen.getByText("Validado por el usuario.")).toBeInTheDocument();
    });

    expect(screen.getAllByRole("button", { name: "Aceptar" })).toHaveLength(2);
  });

  it("edit works through form and shows edited status", async () => {
    openCaseDetail();

    fireEvent.click(screen.getByRole("button", { name: "Analizar relato" }));
    await waitFor(() => expect(screen.getAllByText("Sugerido por IA")).toHaveLength(3));

    const contextSection = screen.getByRole("heading", { name: "Contexto y señal" }).closest("section");
    expect(contextSection).not.toBeNull();
    fireEvent.click(within(contextSection as HTMLElement).getAllByRole("button", { name: "Editar" })[0]);

    const edited = "El proveedor continúa únicamente hasta finalizar el proyecto actual.";
    fireEvent.change(screen.getByLabelText("Editar sugerencia"), { target: { value: edited } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar edición" }));

    await waitFor(() => {
      expect(screen.getByText("Editado por el usuario.")).toBeInTheDocument();
    });

    expect(screen.getByText(edited)).toBeInTheDocument();
  });

  it("reject works and removes suggestion from active view", async () => {
    openCaseDetail();

    fireEvent.click(screen.getByRole("button", { name: "Analizar relato" }));
    await waitFor(() => expect(screen.getAllByText("Sugerido por IA")).toHaveLength(3));

    const contextSection = screen.getByRole("heading", { name: "Contexto y señal" }).closest("section");
    expect(contextSection).not.toBeNull();
    fireEvent.click(within(contextSection as HTMLElement).getAllByRole("button", { name: "Rechazar" })[0]);

    await waitFor(() => {
      expect(screen.getAllByText("Sugerido por IA")).toHaveLength(2);
    });
  });

  it("shows local error and does not persist when Zod validation fails", async () => {
    openCaseDetail(makeInvalidProvider());

    fireEvent.click(screen.getByRole("button", { name: "Analizar relato" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("No se pudieron procesar las sugerencias del relato.");
    });

    const caseId = listDecisionCases()[0]?.id ?? "";
    const items = listCanvasItemsByCase(caseId);

    expect(items).toHaveLength(0);
    expect(screen.queryByText("Sugerido por IA")).not.toBeInTheDocument();
  });

  it("shows empty suggestions message for unrecognized narrative", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Nuevo caso" }));
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Otro caso" } });
    fireEvent.change(screen.getByLabelText("¿Qué está pasando?"), { target: { value: "Relato no reconocido" } });
    fireEvent.click(screen.getByRole("button", { name: "Crear caso" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Abrir" })[0]);

    fireEvent.click(screen.getByRole("button", { name: "Analizar relato" }));

    await waitFor(() => {
      expect(screen.getByText("No se identificaron sugerencias para este relato.")).toBeInTheDocument();
    });
  });

  it("coverage message is not repeated by CaseStatusControl", async () => {
    openCaseDetail();

    fireEvent.click(screen.getByRole("button", { name: "Analizar relato" }));
    await waitFor(() => expect(screen.getAllByText("Sugerido por IA")).toHaveLength(3));

    expect(screen.queryAllByText("Cobertura mínima alcanzada.")).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Iniciar revisión" })).not.toBeInTheDocument();
  });
});

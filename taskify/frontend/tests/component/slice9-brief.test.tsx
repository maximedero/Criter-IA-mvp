import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { clearAiQuestionSessionsForTests } from "../../src/providers/storage/aiSessionStorage";
import { clearBriefsForTests, getBriefRecord } from "../../src/providers/storage/briefStorage";
import { clearCanvasForTests } from "../../src/providers/storage/canvasStorage";
import { clearDecisionCasesForTests } from "../../src/providers/storage/casesStorage";
import { clearCriticalReviewsForTests } from "../../src/providers/storage/criticalReviewStorage";
import { clearHumanSeverityAssessmentsForTests } from "../../src/providers/storage/humanSeverityStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const CASE_ID = "slice9-case";

function seedCaseReadyForBrief(): void {
  const now = new Date().toISOString();

  localStorage.setItem(
    "dw.cases",
    JSON.stringify([
      {
        id: CASE_ID,
        title: "Contrato Dynamics 365 Slice9",
        initialNarrative:
          "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
        status: "BRIEF_DRAFT",
        createdAt: now,
        updatedAt: now,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ])
  );

  localStorage.setItem(
    "dw.canvas",
    JSON.stringify({
      [CASE_ID]: [
        { id: "ctx-1", caseId: CASE_ID, dimension: "CONTEXT", content: "El contrato con el proveedor venció el 31/10/2026.", epistemicType: "FACT", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "ctx-2", caseId: CASE_ID, dimension: "CONTEXT", content: "El proveedor continúa únicamente hasta finalizar el proyecto actual.", epistemicType: "FACT", origin: "USER", validationStatus: "EDITED", createdAt: now, updatedAt: now },
        { id: "exp-1", caseId: CASE_ID, dimension: "EXPOSURE", content: "Actualmente no pueden iniciarse nuevos proyectos ni tareas.", epistemicType: "FACT", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "imp-1", caseId: CASE_ID, dimension: "IMPACT", content: "Nuevas necesidades de mantenimiento correctivo y evolutivo podrían quedar sin capacidad externa.", epistemicType: "INFERENCE", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "evi-1", caseId: CASE_ID, dimension: "EVIDENCE", content: "El proceso de Compras puede demorar aproximadamente entre 1 y 6 meses según conocimiento aportado por el usuario.", epistemicType: "FACT", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "unc-1", caseId: CASE_ID, dimension: "UNCERTAINTY", content: "No conocemos cuándo termina exactamente el proyecto actual.", epistemicType: "MISSING_INFORMATION", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "unc-2", caseId: CASE_ID, dimension: "UNCERTAINTY", content: "No conocemos la demanda de nuevos trabajos durante los próximos meses.", epistemicType: "MISSING_INFORMATION", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "alt-1", caseId: CASE_ID, dimension: "ALTERNATIVE", content: "Una prórroga contractual podría ser una alternativa, pero su viabilidad no está confirmada.", epistemicType: "ASSUMPTION", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "int-1", caseId: CASE_ID, dimension: "INTERVENTION", content: "Necesito que mi superior consulte con Compras qué alternativas contractuales son viables y cuáles son sus plazos.", epistemicType: "HUMAN_EVALUATION", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now }
      ]
    })
  );

  localStorage.setItem(
    "dw.criticalReviews",
    JSON.stringify({
      [CASE_ID]: [
        {
          reviewId: "review-1",
          caseId: CASE_ID,
          createdAt: now,
          updatedAt: now,
          completedAt: now,
          status: "COMPLETED",
          canCompleteReview: true,
          summary: { totalFindings: 2, openBlockers: 0, openWarnings: 1, resolvedFindings: 1 },
          findings: [
            {
              id: "warn-1",
              type: "HIDDEN_ASSUMPTION",
              level: "WARNING",
              title: "Alternativa todavía no confirmada",
              message: "La viabilidad de una prórroga contractual todavía no está confirmada.",
              relatedItemIds: ["alt-1"],
              rationale: "r",
              suggestedHumanAction: "a",
              status: "OPEN"
            },
            {
              id: "res-1",
              type: "INTERVENTION_NOT_ACTIONABLE",
              level: "BLOCKER",
              title: "resuelto",
              message: "resuelto",
              relatedItemIds: ["int-1"],
              rationale: "r",
              suggestedHumanAction: "a",
              status: "RESOLVED_BY_EDIT"
            }
          ]
        }
      ]
    })
  );

  localStorage.setItem("dw.criticalReviewComplete", JSON.stringify({ [CASE_ID]: true }));
  localStorage.setItem(
    "dw.humanSeverityAssessments",
    JSON.stringify({
      [CASE_ID]: {
        caseId: CASE_ID,
        severity: "HIGH",
        rationale:
          "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto.",
        assessedBy: "USER",
        assessedAt: now,
        updatedAt: now,
        status: "ASSESSED"
      }
    })
  );

  const zero = {
    analyzeNarrative: 0,
    suggestNextQuestion: 0,
    reviewCase: 0,
    generateBrief: 0
  };

  localStorage.setItem("dw.ai.observation", JSON.stringify(zero));
}

describe.sequential("slice9 brief ui", () => {
  beforeEach(() => {
    cleanup();
    clearWorkspaceStorage();
    clearDecisionCasesForTests();
    clearCanvasForTests();
    clearAiQuestionSessionsForTests();
    clearCriticalReviewsForTests();
    clearHumanSeverityAssessmentsForTests();
    clearBriefsForTests();
    seedCaseReadyForBrief();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows generate action and does not autogenerate", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    expect(screen.getByText("El caso está listo para preparar el brief.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generar borrador de brief" })).toBeInTheDocument();
    expect(getBriefRecord(CASE_ID).current).toBeNull();
  });

  it("generates brief with two views and expected sections", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    fireEvent.click(screen.getByRole("button", { name: "Generar borrador de brief" }));

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Brief ejecutivo" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Vista expandida" })).toBeInTheDocument();
    });

    const prepSection = screen.getByRole("region", { name: "Preparación del brief" });

    expect(within(prepSection).getByRole("heading", { name: "Situación" })).toBeInTheDocument();
    expect(within(prepSection).getByRole("heading", { name: "Por qué importa" })).toBeInTheDocument();
    expect(within(prepSection).getByRole("heading", { name: "Impactos posibles" })).toBeInTheDocument();
    expect(within(prepSection).getByRole("heading", { name: "Evidencia" })).toBeInTheDocument();
    expect(within(prepSection).getByRole("heading", { name: "Incertidumbres" })).toBeInTheDocument();
    expect(within(prepSection).getByRole("heading", { name: "Escenarios / alternativas" })).toBeInTheDocument();
    expect(within(prepSection).getByRole("heading", { name: "Intervención requerida" })).toBeInTheDocument();
    expect(screen.getByText("Gravedad: Alta")).toBeInTheDocument();
    expect(screen.getByText("Evaluación realizada por el usuario.")).toBeInTheDocument();

    expect(screen.queryByText(/score|recomendación ia/i)).not.toBeInTheDocument();
  });

  it("editing keeps exact text and no additional AI calls", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    fireEvent.click(screen.getByRole("button", { name: "Generar borrador de brief" }));

    await waitFor(() => expect(screen.getByText("Por qué importa")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Editar Por qué importa" }));

    const edited =
      "La restricción impide iniciar nuevos proyectos o tareas y puede limitar la atención externa de nuevas necesidades.";

    fireEvent.change(screen.getByLabelText("Por qué importa"), {
      target: { value: edited }
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar edición" }));

    expect(screen.getByText(edited)).toBeInTheDocument();

    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
    expect(counters.generateBrief).toBe(1);
    expect(counters.reviewCase).toBe(0);
    expect(counters.analyzeNarrative).toBe(0);
    expect(counters.suggestNextQuestion).toBe(0);
  });

  it("mark reviewed requires click and persists without changing case status", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    fireEvent.click(screen.getByRole("button", { name: "Generar borrador de brief" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Marcar brief como revisado" })).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Marcar brief como revisado" }));

    expect(confirmSpy).toHaveBeenCalledWith("Confirmás que revisaste el contenido del brief.");
    expect(screen.getByText("Brief revisado por el usuario.")).toBeInTheDocument();

    const record = getBriefRecord(CASE_ID);
    expect(record.current?.status).toBe("REVIEWED_BY_USER");

    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ status: string }>;
    expect(cases[0]?.status).toBe("BRIEF_DRAFT");
    expect(screen.queryByText(/aprobado|listo para elevar/i)).not.toBeInTheDocument();
  });

  it("expanded view shows categories and warnings", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    fireEvent.click(screen.getByRole("button", { name: "Generar borrador de brief" }));

    await waitFor(() => expect(screen.getByRole("tab", { name: "Vista expandida" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("tab", { name: "Vista expandida" }));

    expect(screen.getByText("Hechos")).toBeInTheDocument();
    expect(screen.getByText("Inferencias")).toBeInTheDocument();
    expect(screen.getByText("Supuestos")).toBeInTheDocument();
    expect(screen.getByText("Datos faltantes")).toBeInTheDocument();
    expect(screen.getByText("Evaluaciones humanas")).toBeInTheDocument();
    expect(screen.getByText("Warnings abiertos")).toBeInTheDocument();
    expect(screen.getByText("Findings resueltos")).toBeInTheDocument();
    expect(screen.getByText("Limitaciones de generación")).toBeInTheDocument();
  });

  it("shows storage error and keeps BRIEF_DRAFT when brief persistence fails", async () => {
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === "dw.briefs") {
        throw new Error("storage failure");
      }

      return setItem.call(this, key, value);
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    fireEvent.click(screen.getByRole("button", { name: "Generar borrador de brief" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar el brief.");
    });

    const record = getBriefRecord(CASE_ID);
    expect(record.current).toBeNull();

    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ status: string }>;
    expect(cases[0]?.status).toBe("BRIEF_DRAFT");
  });
});

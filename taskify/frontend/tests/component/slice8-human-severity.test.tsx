import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../../src/app/App";
import { clearAiQuestionSessionsForTests } from "../../src/providers/storage/aiSessionStorage";
import { clearCanvasForTests } from "../../src/providers/storage/canvasStorage";
import { clearDecisionCasesForTests } from "../../src/providers/storage/casesStorage";
import { clearCriticalReviewsForTests } from "../../src/providers/storage/criticalReviewStorage";
import { clearHumanSeverityAssessmentsForTests, getHumanSeverityAssessment } from "../../src/providers/storage/humanSeverityStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const CASE_ID = "slice8-case";

function seedCaseInHumanEvaluation(): void {
  const now = new Date().toISOString();

  localStorage.setItem(
    "dw.cases",
    JSON.stringify([
      {
        id: CASE_ID,
        title: "Contrato Dynamics 365 Slice8",
        initialNarrative:
          "El contrato con el proveedor venció el 31/10/2026. Actualmente continúa trabajando hasta finalizar el proyecto en curso, pero no podemos iniciar nuevos proyectos ni tareas.",
        status: "HUMAN_EVALUATION",
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
        { id: "1", caseId: CASE_ID, dimension: "CONTEXT", content: "c1", epistemicType: "FACT", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "2", caseId: CASE_ID, dimension: "EXPOSURE", content: "e1", epistemicType: "FACT", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "3", caseId: CASE_ID, dimension: "IMPACT", content: "i1", epistemicType: "FACT", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "4", caseId: CASE_ID, dimension: "EVIDENCE", content: "ev1", epistemicType: "FACT", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "5", caseId: CASE_ID, dimension: "UNCERTAINTY", content: "u1", epistemicType: "MISSING_INFORMATION", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now },
        { id: "6", caseId: CASE_ID, dimension: "INTERVENTION", content: "int1", epistemicType: "HUMAN_EVALUATION", origin: "USER", validationStatus: "VALIDATED", createdAt: now, updatedAt: now }
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
          summary: { totalFindings: 1, openBlockers: 0, openWarnings: 1, resolvedFindings: 0 },
          findings: [
            {
              id: "warn-1",
              type: "OTHER_REVIEW_CONCERN",
              level: "WARNING",
              title: "Advertencia abierta",
              message: "Advertencia permitida",
              relatedItemIds: ["6"],
              rationale: "r",
              suggestedHumanAction: "a",
              status: "OPEN"
            }
          ]
        }
      ]
    })
  );

  localStorage.setItem("dw.criticalReviewComplete", JSON.stringify({ [CASE_ID]: true }));
}

function openSeededCase() {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
}

describe.sequential("Slice8 human severity", () => {
  beforeEach(() => {
    cleanup();
    clearWorkspaceStorage();
    clearDecisionCasesForTests();
    clearCanvasForTests();
    clearAiQuestionSessionsForTests();
    clearCriticalReviewsForTests();
    clearHumanSeverityAssessmentsForTests();
    seedCaseInHumanEvaluation();
  });

  it("shows human severity panel with five options and UNASSESSED default", () => {
    openSeededCase();

    expect(screen.getByRole("heading", { name: "EVALUACIÓN HUMANA DE GRAVEDAD" })).toBeInTheDocument();
    expect(screen.getByText("Esta evaluación debe ser realizada por una persona. La IA no asigna ni recomienda la gravedad.")).toBeInTheDocument();
    expect(screen.getByText("Evaluación realizada por el usuario.")).toBeInTheDocument();
    expect(screen.getByText("Advertencias abiertas: 1")).toBeInTheDocument();

    expect(screen.getByRole("group", { name: "Gravedad del riesgo" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "Sin evaluar" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Baja" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Media" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Alta" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "Crítica" })).not.toBeChecked();

    expect(screen.queryByText(/gravedad sugerida|score|recomendación de ia/i)).not.toBeInTheDocument();
  });

  it("saving HIGH persists rationale and keeps HUMAN_EVALUATION", () => {
    openSeededCase();

    fireEvent.click(screen.getByRole("radio", { name: "Alta" }));
    const rationale =
      "Considero alta la gravedad porque la restricción contractual puede dejar sin capacidad externa nuevas necesidades correctivas y evolutivas durante un plazo todavía incierto.";

    fireEvent.change(screen.getByLabelText("Fundamento de la evaluación (opcional)"), { target: { value: rationale } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar evaluación" }));

    expect(screen.getByText("Evaluación guardada.")).toBeInTheDocument();

    const saved = getHumanSeverityAssessment(CASE_ID);
    expect(saved.severity).toBe("HIGH");
    expect(saved.status).toBe("ASSESSED");
    expect(saved.assessedBy).toBe("USER");
    expect(saved.assessedAt).not.toBeNull();
    expect(saved.rationale).toBe(rationale);

    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ status: string }>;
    expect(cases[0]?.status).toBe("HUMAN_EVALUATION");
  });

  it("UNASSESSED blocks continue and HIGH requires explicit click to continue", () => {
    openSeededCase();

    fireEvent.click(screen.getByRole("button", { name: "Continuar a preparación del brief" }));
    expect(screen.getByText("Seleccioná una gravedad antes de continuar.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Alta" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar evaluación" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar a preparación del brief" }));

    expect(screen.getAllByText("Brief borrador").length).toBeGreaterThan(0);
    expect(screen.getByText("El caso está listo para preparar el brief.")).toBeInTheDocument();
    expect(screen.queryByText(/Aprobar brief|Listo para elevar|Resumen ejecutivo/i)).not.toBeInTheDocument();
  });

  it("reload preserves selected severity and rationale", () => {
    openSeededCase();

    fireEvent.click(screen.getByRole("radio", { name: "Media" }));
    fireEvent.change(screen.getByLabelText("Fundamento de la evaluación (opcional)"), { target: { value: "texto exacto" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar evaluación" }));

    cleanup();
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    expect(screen.getByRole("radio", { name: "Media" })).toBeChecked();
    expect(screen.getByLabelText("Fundamento de la evaluación (opcional)")).toHaveValue("texto exacto");
    expect(screen.getByText("Evaluación realizada por el usuario.")).toBeInTheDocument();
  });
});

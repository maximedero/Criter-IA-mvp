import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../../src/app/App";
import { clearAiQuestionSessionsForTests } from "../../src/providers/storage/aiSessionStorage";
import { clearBriefsForTests } from "../../src/providers/storage/briefStorage";
import { clearCanvasForTests } from "../../src/providers/storage/canvasStorage";
import { clearDecisionCasesForTests } from "../../src/providers/storage/casesStorage";
import { clearCriticalReviewsForTests } from "../../src/providers/storage/criticalReviewStorage";
import { clearHumanBriefApprovalsForTests, getHumanBriefApproval } from "../../src/providers/storage/humanApprovalStorage";
import { clearHumanSeverityAssessmentsForTests } from "../../src/providers/storage/humanSeverityStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const CASE_ID = "slice10-case";

function seedReadyReviewedCase(status: "BRIEF_DRAFT" | "READY_TO_ESCALATE" = "BRIEF_DRAFT"): void {
  const now = new Date().toISOString();

  localStorage.setItem(
    "dw.cases",
    JSON.stringify([
      {
        id: CASE_ID,
        title: "Contrato Dynamics 365 Slice10",
        initialNarrative:
          "El contrato con el proveedor venció el 31/10/2026. El proveedor continúa únicamente hasta finalizar el proyecto actual. Actualmente no pueden iniciarse nuevos proyectos ni tareas.",
        status,
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
          summary: { totalFindings: 1, openBlockers: 0, openWarnings: 1, resolvedFindings: 0 },
          findings: [
            {
              id: "warn-1",
              type: "HIDDEN_ASSUMPTION",
              level: "WARNING",
              title: "Alternativa todavía no confirmada",
              message: "La viabilidad de una prórroga contractual todavía no está confirmada.",
              relatedItemIds: ["imp-1"],
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
  localStorage.setItem(
    "dw.humanSeverityAssessments",
    JSON.stringify({
      [CASE_ID]: {
        caseId: CASE_ID,
        severity: "HIGH",
        rationale: "Considero alta la gravedad.",
        assessedBy: "USER",
        assessedAt: now,
        updatedAt: now,
        status: "ASSESSED"
      }
    })
  );

  localStorage.setItem(
    "dw.briefs",
    JSON.stringify({
      [CASE_ID]: {
        stale: false,
        history: [],
        current: {
          id: "brief-2",
          caseId: CASE_ID,
          version: 2,
          status: "REVIEWED_BY_USER",
          executive: {
            situation: { content: "Situación", sourceItemIds: ["ctx-1"], hasSufficientInformation: true, limitations: [] },
            whyItMatters: { content: "Exposición", sourceItemIds: ["exp-1"], hasSufficientInformation: true, limitations: [] },
            possibleImpacts: { content: "Impacto", sourceItemIds: ["imp-1"], hasSufficientInformation: true, limitations: [] },
            evidence: { content: "Evidencia", sourceItemIds: ["evi-1"], hasSufficientInformation: true, limitations: [] },
            uncertainties: { content: "Incertidumbre", sourceItemIds: ["unc-1"], hasSufficientInformation: true, limitations: [] },
            scenariosAndAlternatives: {
              content: "No identificados con la evidencia disponible.",
              sourceItemIds: [],
              hasSufficientInformation: false,
              limitations: ["No se identificaron escenarios o alternativas válidas."]
            },
            severity: {
              value: "HIGH",
              label: "Alta",
              rationale: "Considero alta la gravedad.",
              assessedBy: "USER",
              assessedAt: now,
              notice: "Evaluación realizada por el usuario."
            },
            requiredIntervention: { content: "Intervención", sourceItemIds: ["int-1"], hasSufficientInformation: true, limitations: [] }
          },
          expanded: {
            facts: [],
            inferences: [],
            assumptions: [],
            missingInformation: [],
            humanEvaluations: [],
            evidenceItems: [],
            openWarnings: [],
            resolvedFindings: [],
            sources: [],
            generationLimitations: []
          },
          traceability: {
            sectionSources: {
              situation: ["ctx-1"],
              whyItMatters: ["exp-1"],
              possibleImpacts: ["imp-1"],
              evidence: ["evi-1"],
              uncertainties: ["unc-1"],
              scenariosAndAlternatives: [],
              requiredIntervention: ["int-1"]
            },
            severityAssessmentRef: `${CASE_ID}:severity`,
            criticalReviewId: "review-1",
            generatedFromCanvasUpdatedAt: now,
            generationProvider: "MockAIProvider",
            generationTimestamp: now,
            editedSections: [],
            userReviewTimestamp: now
          },
          generatedBy: "AI",
          reviewedByUser: true,
          createdAt: now,
          updatedAt: now,
          reviewedAt: now
        }
      }
    })
  );

  localStorage.setItem(
    "dw.ai.observation",
    JSON.stringify({
      analyzeNarrative: 0,
      suggestNextQuestion: 0,
      reviewCase: 0,
      generateBrief: 0
    })
  );
}

describe.sequential("slice10 human approval ui", () => {
  beforeEach(() => {
    cleanup();
    clearWorkspaceStorage();
    clearDecisionCasesForTests();
    clearCanvasForTests();
    clearAiQuestionSessionsForTests();
    clearCriticalReviewsForTests();
    clearHumanSeverityAssessmentsForTests();
    clearBriefsForTests();
    clearHumanBriefApprovalsForTests();
    seedReadyReviewedCase("BRIEF_DRAFT");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows checklist and requires explicit approve + confirm flow", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    expect(screen.getByRole("heading", { name: "APROBACIÓN HUMANA" })).toBeInTheDocument();
    expect(screen.getByText("El sistema verifica las condiciones necesarias, pero la aprobación final debe realizarla una persona.")).toBeInTheDocument();
    expect(screen.getByText("CHECKLIST FINAL")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Aprobar brief" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Aprobar brief" }));

    const dialog = screen.getByRole("dialog", { name: "Confirmar aprobación" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Estás por marcar este caso como LISTO PARA ELEVAR.")).toBeInTheDocument();
    expect(screen.getByText("Versión del brief: v2")).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Gravedad: Alta");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog", { name: "Confirmar aprobación" })).not.toBeInTheDocument();

    const approvalAfterCancel = getHumanBriefApproval(CASE_ID);
    expect(approvalAfterCancel?.status).toBe("NOT_APPROVED");

    const casesAfterCancel = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ status: string }>;
    expect(casesAfterCancel[0]?.status).toBe("BRIEF_DRAFT");

    fireEvent.click(screen.getByRole("button", { name: "Aprobar brief" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar aprobación" }));

    await waitFor(() => {
      expect(screen.getByText("LISTO PARA ELEVAR")).toBeInTheDocument();
    });

    expect(screen.getAllByText("El brief fue revisado y aprobado por el usuario.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aprobación realizada por el usuario.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Evaluación realizada por el usuario.").length).toBeGreaterThan(0);
    expect(screen.getByText("Listo para elevar indica preparación del brief, no aprobación de la decisión por parte del destinatario.")).toBeInTheDocument();

    const approval = getHumanBriefApproval(CASE_ID);
    expect(approval?.status).toBe("APPROVED");
    expect(approval?.confirmedBriefVersion).toBe(2);

    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ status: string }>;
    expect(cases[0]?.status).toBe("READY_TO_ESCALATE");

    const counters = JSON.parse(localStorage.getItem("dw.ai.observation") ?? "{}");
    expect(counters.generateBrief).toBe(0);
    expect(counters.analyzeNarrative).toBe(0);
    expect(counters.suggestNextQuestion).toBe(0);
    expect(counters.reviewCase).toBe(0);
  });

  it("blocks approval when precondition changes between open dialog and confirm", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    fireEvent.click(screen.getByRole("button", { name: "Aprobar brief" }));

    const staleRaw = JSON.parse(localStorage.getItem("dw.briefs") ?? "{}");
    staleRaw[CASE_ID].stale = true;
    localStorage.setItem("dw.briefs", JSON.stringify(staleRaw));

    fireEvent.click(screen.getByRole("button", { name: "Confirmar aprobación" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Las condiciones cambiaron y el brief ya no puede aprobarse.");
    });

    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ status: string }>;
    expect(cases[0]?.status).toBe("BRIEF_DRAFT");

    const approval = getHumanBriefApproval(CASE_ID);
    expect(approval?.status).toBe("NOT_APPROVED");
  });

  it("shows storage error when approval cannot be persisted", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "APROBACIÓN HUMANA" })).toBeInTheDocument();
    });

    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === "dw.humanBriefApprovals") {
        throw new Error("storage failure");
      }

      return setItem.call(this, key, value);
    });

    fireEvent.click(screen.getByRole("button", { name: "Aprobar brief" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar aprobación" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar la aprobación.");
    });

    const cases = JSON.parse(localStorage.getItem("dw.cases") ?? "[]") as Array<{ status: string }>;
    expect(cases[0]?.status).toBe("BRIEF_DRAFT");
  });

  it("shows READY view persisted after reload and disables direct brief editing", async () => {
    seedReadyReviewedCase("READY_TO_ESCALATE");
    const now = new Date().toISOString();
    localStorage.setItem(
      "dw.humanBriefApprovals",
      JSON.stringify({
        [CASE_ID]: {
          caseId: CASE_ID,
          briefId: "brief-2",
          briefVersion: 2,
          status: "APPROVED",
          approvedBy: "USER",
          approvedAt: now,
          confirmedBriefVersion: 2,
          checklistSnapshot: {
            ready: true,
            checks: [],
            blockers: [],
            evaluatedAt: now
          },
          createdAt: now,
          updatedAt: now
        }
      })
    );

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

    expect(screen.getByText("LISTO PARA ELEVAR")).toBeInTheDocument();
    expect(screen.getByText("Este brief corresponde a una versión aprobada.")).toBeInTheDocument();

    const editButton = screen.getByRole("button", { name: "Editar Situación" });
    expect(editButton).toBeDisabled();

    expect(screen.queryByText(/Outlook|Teams|enviar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/aprobado por ia|recomendación ia|score|% listo/i)).not.toBeInTheDocument();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import type { ReviewCaseResult } from "../../src/domain/models/CriticalReview";
import {
  acknowledgeFindingAsUncertainty,
  completeCriticalReview,
  dismissFinding,
  markFindingResolvedByEdit,
  resolveFindingByClarification
} from "../../src/domain/workflow/criticalReviewActions";
import { createCanvasItemWithMetadata, clearCanvasForTests } from "../../src/providers/storage/canvasStorage";
import {
  clearCriticalReviewsForTests,
  getCriticalReview,
  isCriticalReviewComplete,
  persistReviewResult
} from "../../src/providers/storage/criticalReviewStorage";
import { clearWorkspaceStorage } from "../setup/test-helpers";

const CASE_ID = "case-review-actions";

function baseReviewResult(overrides?: Partial<ReviewCaseResult>): ReviewCaseResult {
  return {
    reviewId: "review-1",
    findings: [
      {
        id: "f1",
        type: "POTENTIAL_CONTRADICTION",
        level: "WARNING",
        title: "Vencimiento y continuidad requieren aclaración",
        message: "mensaje",
        relatedItemIds: ["context-1", "context-2"],
        rationale: "rationale",
        suggestedHumanAction: "aclarar",
        status: "OPEN"
      },
      {
        id: "f2",
        type: "UNSUPPORTED_CLAIM",
        level: "BLOCKER",
        title: "Impacto cuantitativo sin sustento suficiente",
        message: "mensaje",
        relatedItemIds: ["impact-1"],
        rationale: "rationale",
        suggestedHumanAction: "editar",
        status: "OPEN"
      }
    ],
    summary: {
      totalFindings: 2,
      openBlockers: 1,
      openWarnings: 1,
      resolvedFindings: 0
    },
    canCompleteReview: false,
    ...overrides
  };
}

describe("criticalReviewActions", () => {
  beforeEach(() => {
    clearWorkspaceStorage();
    clearCanvasForTests();
    clearCriticalReviewsForTests();

    createCanvasItemWithMetadata(
      {
        caseId: CASE_ID,
        dimension: "CONTEXT",
        content: "El contrato con el proveedor venció el 31/10/2026.",
        epistemicType: "FACT"
      },
      {
        origin: "USER",
        validationStatus: "VALIDATED"
      }
    );

    createCanvasItemWithMetadata(
      {
        caseId: CASE_ID,
        dimension: "CONTEXT",
        content: "El proveedor continúa trabajando hasta finalizar el proyecto actualmente en curso.",
        epistemicType: "FACT"
      },
      {
        origin: "USER",
        validationStatus: "VALIDATED"
      }
    );

    const impact = createCanvasItemWithMetadata(
      {
        caseId: CASE_ID,
        dimension: "IMPACT",
        content: "200 usuarios quedarán sin servicio.",
        epistemicType: "FACT"
      },
      {
        origin: "USER",
        validationStatus: "VALIDATED"
      }
    );

    const review = baseReviewResult({
      findings: [
        {
          ...baseReviewResult().findings[0],
          relatedItemIds: []
        },
        {
          ...baseReviewResult().findings[1],
          relatedItemIds: [impact.id]
        }
      ]
    });

    persistReviewResult(CASE_ID, review);
  });

  it("editing item does not auto resolve finding", () => {
    const review = getCriticalReview(CASE_ID);
    expect(review?.findings[1].status).toBe("OPEN");
  });

  it("mark resolved by edit updates status", () => {
    markFindingResolvedByEdit(CASE_ID, "f2");

    const review = getCriticalReview(CASE_ID);
    expect(review?.findings.find((item) => item.id === "f2")?.status).toBe("RESOLVED_BY_EDIT");
  });

  it("clarification resolves finding and persists text", () => {
    resolveFindingByClarification(CASE_ID, "f1", "El contrato venció formalmente, pero hay continuidad transitoria.");

    const review = getCriticalReview(CASE_ID);
    const finding = review?.findings.find((item) => item.id === "f1");

    expect(finding?.status).toBe("RESOLVED_BY_CLARIFICATION");
    expect(finding?.clarification).toContain("continuidad transitoria");
  });

  it("dismiss requires non-empty reason", () => {
    expect(() => dismissFinding(CASE_ID, "f1", "   ")).toThrow("La razón de descarte es obligatoria.");
  });

  it("dismiss persists reason", () => {
    dismissFinding(CASE_ID, "f1", "No aplica porque ya fue aclarado en reunión interna.");

    const review = getCriticalReview(CASE_ID);
    const finding = review?.findings.find((item) => item.id === "f1");
    expect(finding?.status).toBe("DISMISSED_BY_USER");
    expect(finding?.dismissReason).toContain("reunión interna");
  });

  it("unsupported quantitative fact cannot be acknowledged as uncertainty without edit", () => {
    expect(() =>
      acknowledgeFindingAsUncertainty(
        CASE_ID,
        "f2",
        "No hay datos para cuantificar exactamente afectados.",
        "MISSING_INFORMATION"
      )
    ).toThrow("Este hallazgo requiere edición humana antes de reconocer incertidumbre.");
  });

  it("complete review sets criticalReviewComplete true with no open blockers", () => {
    markFindingResolvedByEdit(CASE_ID, "f2");
    resolveFindingByClarification(CASE_ID, "f1", "Aclaro relación contractual.");

    createCanvasItemWithMetadata(
      {
        caseId: CASE_ID,
        dimension: "EXPOSURE",
        content: "Exposición validada para sostener cobertura mínima.",
        epistemicType: "FACT"
      },
      {
        origin: "USER",
        validationStatus: "VALIDATED"
      }
    );

    createCanvasItemWithMetadata(
      {
        caseId: CASE_ID,
        dimension: "EVIDENCE",
        content: "Evidencia validada para sostener cobertura mínima.",
        epistemicType: "FACT"
      },
      {
        origin: "USER",
        validationStatus: "VALIDATED"
      }
    );

    createCanvasItemWithMetadata(
      {
        caseId: CASE_ID,
        dimension: "UNCERTAINTY",
        content: "Persisten incertidumbres operativas relevantes.",
        epistemicType: "MISSING_INFORMATION"
      },
      {
        origin: "USER",
        validationStatus: "VALIDATED"
      }
    );

    createCanvasItemWithMetadata(
      {
        caseId: CASE_ID,
        dimension: "INTERVENTION",
        content: "Se requiere intervención accionable del superior.",
        epistemicType: "HUMAN_EVALUATION"
      },
      {
        origin: "USER",
        validationStatus: "VALIDATED"
      }
    );

    completeCriticalReview(CASE_ID);

    const review = getCriticalReview(CASE_ID);
    expect(review?.status).toBe("COMPLETED");
    expect(isCriticalReviewComplete(CASE_ID)).toBe(true);
  });
});

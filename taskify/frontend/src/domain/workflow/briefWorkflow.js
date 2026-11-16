import { HUMAN_SEVERITY_LABELS } from "../models/HumanSeverityAssessment";
export const BRIEF_GATE_ERRORS = {
    NOT_IN_BRIEF_DRAFT: "El caso no está en estado Brief borrador.",
    MINIMUM_COVERAGE_LOST: "La cobertura mínima ya no está completa.",
    CRITICAL_REVIEW_INCOMPLETE: "La revisión crítica no está completa.",
    OPEN_BLOCKERS: "Existen bloqueos críticos abiertos.",
    SEVERITY_UNASSESSED: "La gravedad todavía no fue evaluada por el usuario.",
    CRITICAL_REVIEW_NOT_FOUND: "No existe una revisión crítica completada para este caso.",
    REVIEW_REQUIRES_EXECUTIVE_VIEW: "Debés visualizar el brief ejecutivo antes de marcarlo como revisado.",
    MISSING_REQUIRED_SECTIONS: "Faltan secciones obligatorias del brief.",
    STALE_BRIEF: "El análisis cambió después de generar este brief.",
    INVALID_BRIEF_OUTPUT: "No se pudo generar el borrador del brief."
};
function nowIso() {
    return new Date().toISOString();
}
export function evaluateBriefGenerationGate(context) {
    const reasonCodes = [];
    if (context.caseStatus !== "BRIEF_DRAFT") {
        reasonCodes.push("NOT_IN_BRIEF_DRAFT");
    }
    if (!context.hasMinimumCoverage) {
        reasonCodes.push("MINIMUM_COVERAGE_LOST");
    }
    if (!context.criticalReviewComplete) {
        reasonCodes.push("CRITICAL_REVIEW_INCOMPLETE");
    }
    if (!context.criticalReview) {
        reasonCodes.push("CRITICAL_REVIEW_NOT_FOUND");
    }
    if (context.openBlockers > 0) {
        reasonCodes.push("OPEN_BLOCKERS");
    }
    if (context.humanSeverity === "UNASSESSED") {
        reasonCodes.push("SEVERITY_UNASSESSED");
    }
    return {
        allowed: reasonCodes.length === 0,
        reasonCodes,
        reasons: reasonCodes.map((code) => BRIEF_GATE_ERRORS[code])
    };
}
export function getLatestCanvasUpdatedAt(items) {
    return items.reduce((latest, item) => {
        if (!latest) {
            return item.updatedAt;
        }
        return new Date(item.updatedAt).getTime() > new Date(latest).getTime() ? item.updatedAt : latest;
    }, "");
}
export function calculateBriefStale(brief, activeItems) {
    if (!brief) {
        return false;
    }
    const latestCanvasUpdatedAt = getLatestCanvasUpdatedAt(activeItems);
    if (!latestCanvasUpdatedAt) {
        return false;
    }
    return new Date(latestCanvasUpdatedAt).getTime() > new Date(brief.traceability.generatedFromCanvasUpdatedAt).getTime();
}
function sectionHasRenderableContent(section) {
    if (section.hasSufficientInformation) {
        return section.content.trim().length > 0;
    }
    return section.content.trim().length > 0 && section.limitations.length > 0;
}
export function canMarkBriefAsReviewed(context) {
    const reasonCodes = [];
    if (!context.brief || context.generationError) {
        reasonCodes.push("MISSING_REQUIRED_SECTIONS");
    }
    if (!context.hasViewedExecutive) {
        reasonCodes.push("REVIEW_REQUIRES_EXECUTIVE_VIEW");
    }
    if (context.stale) {
        reasonCodes.push("STALE_BRIEF");
    }
    if (!context.hasMinimumCoverage || context.openBlockers > 0 || context.humanSeverity === "UNASSESSED") {
        reasonCodes.push("MISSING_REQUIRED_SECTIONS");
    }
    if (context.brief) {
        const hasCommunicationContent = context.brief.communication.email.body.trim().length > 0 && context.brief.communication.message.body.trim().length > 0;
        if (!hasCommunicationContent) {
            reasonCodes.push("MISSING_REQUIRED_SECTIONS");
        }
        const requiredSections = [
            "situation",
            "whyItMatters",
            "possibleImpacts",
            "evidence",
            "uncertainties",
            "scenariosAndAlternatives",
            "requiredIntervention"
        ];
        const missing = requiredSections.some((key) => !sectionHasRenderableContent(context.brief.executive[key]));
        if (missing) {
            reasonCodes.push("MISSING_REQUIRED_SECTIONS");
        }
    }
    const unique = Array.from(new Set(reasonCodes));
    return {
        allowed: unique.length === 0,
        reasonCodes: unique,
        reasons: unique.map((code) => BRIEF_GATE_ERRORS[code])
    };
}
export function updateCommunicationAsEdited(brief, target, content) {
    const updatedAt = nowIso();
    return {
        ...brief,
        status: "EDITED_BY_USER",
        communication: {
            email: {
                ...brief.communication.email,
                subject: target === "emailSubject" ? content : brief.communication.email.subject,
                body: target === "emailBody" ? content : brief.communication.email.body,
                editedByUser: target === "emailSubject" || target === "emailBody" ? true : brief.communication.email.editedByUser,
                updatedAt: target === "emailSubject" || target === "emailBody" ? updatedAt : brief.communication.email.updatedAt
            },
            message: {
                ...brief.communication.message,
                body: target === "messageBody" ? content : brief.communication.message.body,
                editedByUser: target === "messageBody" ? true : brief.communication.message.editedByUser,
                updatedAt: target === "messageBody" ? updatedAt : brief.communication.message.updatedAt
            }
        },
        reviewedByUser: false,
        reviewedAt: null,
        updatedAt
    };
}
export function createBriefGenerationInput(params) {
    const consolidable = params.activeItems.filter((item) => item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED");
    const openWarnings = params.completedCriticalReview.findings.filter((finding) => finding.level === "WARNING" && finding.status === "OPEN");
    return {
        caseId: params.caseId,
        caseTitle: params.caseTitle,
        initialNarrative: params.initialNarrative,
        activeCanvasItems: consolidable,
        humanSeverityAssessment: {
            ...params.humanSeverityAssessment,
            assessedBy: "USER"
        },
        completedCriticalReview: params.completedCriticalReview,
        openWarnings,
        contextualQuestionHistory: params.contextualQuestionHistory,
        currentCaseStatus: params.currentCaseStatus
    };
}
export function updateSectionAsEdited(brief, section, content) {
    const nextEdited = brief.traceability.editedSections.includes(section)
        ? brief.traceability.editedSections
        : [...brief.traceability.editedSections, section];
    return {
        ...brief,
        status: "EDITED_BY_USER",
        executive: {
            ...brief.executive,
            [section]: {
                ...brief.executive[section],
                content
            }
        },
        traceability: {
            ...brief.traceability,
            editedSections: nextEdited
        },
        reviewedByUser: false,
        reviewedAt: null,
        updatedAt: nowIso()
    };
}
export function markBriefAsReviewed(brief) {
    const reviewedAt = nowIso();
    return {
        ...brief,
        status: "REVIEWED_BY_USER",
        reviewedByUser: true,
        reviewedAt,
        updatedAt: reviewedAt,
        traceability: {
            ...brief.traceability,
            userReviewTimestamp: reviewedAt
        }
    };
}
export function ensureHumanSeverityCopied(brief, assessment) {
    return {
        ...brief,
        executive: {
            ...brief.executive,
            severity: {
                ...brief.executive.severity,
                value: assessment.severity,
                label: HUMAN_SEVERITY_LABELS[assessment.severity],
                rationale: assessment.rationale ?? null,
                assessedBy: "USER",
                assessedAt: assessment.assessedAt ?? brief.executive.severity.assessedAt,
                notice: "Evaluación realizada por el usuario."
            }
        }
    };
}
export function normalizeGeneratedBriefForPersist(brief, version, traceabilityPatch) {
    const now = nowIso();
    return {
        ...brief,
        version,
        status: "GENERATED",
        generatedBy: "AI",
        reviewedByUser: false,
        reviewedAt: null,
        createdAt: brief.createdAt || now,
        updatedAt: now,
        traceability: {
            ...brief.traceability,
            ...traceabilityPatch,
            generationProvider: "MockAIProvider",
            generationTimestamp: now,
            editedSections: []
        }
    };
}

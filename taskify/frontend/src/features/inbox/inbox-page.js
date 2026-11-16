import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { CASE_STATUS_LABELS } from "../../domain/models/CaseStatus";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import { calculateReviewSummary } from "../../domain/rules/reviewRules";
import { canTransition } from "../../domain/workflow/caseStateMachine";
import { canAdvanceToBriefDraft } from "../../domain/workflow/humanSeverityWorkflow";
import { MockAIProvider } from "../../providers/ai";
import { getBriefRecord } from "../../providers/storage/briefStorage";
import { listCanvasItemsByCase } from "../../providers/storage/canvasStorage";
import { createDecisionCase, deleteDecisionCase, getDecisionCaseById, listDecisionCases, updateDecisionCaseStatus } from "../../providers/storage/casesStorage";
import { getCriticalReview, isCriticalReviewComplete } from "../../providers/storage/criticalReviewStorage";
import { getHumanSeverityAssessment } from "../../providers/storage/humanSeverityStorage";
import { getHumanBriefApproval } from "../../providers/storage/humanApprovalStorage";
import { HumanSeverityPanel, mapMissingCoverageLabels } from "../canvas/HumanSeverityPanel";
import { CanvasPage } from "../canvas/canvas-page";
import { BriefWorkspace } from "../brief/BriefWorkspace";
import { CriticalReviewPanel } from "../review/CriticalReviewPanel";
import { Button } from "../../app/ui/Button";
import { CaseForm } from "./CaseForm";
import { CaseStatusControl } from "./CaseStatusControl";
import "./inbox-page.css";
function formatUpdatedAt(value) {
    return new Date(value).toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}
export function InboxPage({ aiProvider }) {
    const [items, setItems] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [selectedCaseItems, setSelectedCaseItems] = useState([]);
    const [briefError, setBriefError] = useState(null);
    const [viewMode, setViewMode] = useState("inbox");
    const refresh = () => {
        const listed = listDecisionCases();
        setItems(listed);
        if (selectedCaseId) {
            setSelectedCaseItems(listCanvasItemsByCase(selectedCaseId));
        }
    };
    useEffect(() => {
        refresh();
    }, []);
    const provider = useMemo(() => aiProvider ?? new MockAIProvider(), [aiProvider]);
    const selectedCase = useMemo(() => {
        if (!selectedCaseId) {
            return null;
        }
        return getDecisionCaseById(selectedCaseId);
    }, [selectedCaseId, items]);
    if (viewMode === "detail" && selectedCase) {
        const coverage = evaluateMinimumCoverage(selectedCaseItems);
        const review = getCriticalReview(selectedCase.id);
        const reviewSummary = review ? calculateReviewSummary(review.findings) : null;
        const openBlockers = reviewSummary?.openBlockers ?? 0;
        const openWarnings = reviewSummary?.openWarnings ?? 0;
        const criticalReviewComplete = isCriticalReviewComplete(selectedCase.id);
        const severityAssessment = getHumanSeverityAssessment(selectedCase.id);
        const handleStatusChange = (status) => {
            updateDecisionCaseStatus(selectedCase.id, status);
            refresh();
        };
        const shouldRenderHumanSeverityPanel = selectedCase.status === "HUMAN_EVALUATION" ||
            (selectedCase.status === "CRITICAL_REVIEW" && criticalReviewComplete) ||
            selectedCase.status === "BRIEF_DRAFT";
        const shouldRenderBriefWorkspace = selectedCase.status === "BRIEF_DRAFT" || selectedCase.status === "READY_TO_ESCALATE";
        return (_jsxs("section", { className: "dw-case-detail", children: [_jsx("h2", { children: "Detalle de caso" }), _jsxs("div", { className: "dw-case-detail__summary", children: [_jsxs("p", { children: [_jsx("strong", { children: "T\u00EDtulo:" }), " ", selectedCase.title] }), _jsxs("p", { children: [_jsx("strong", { children: "Estado:" }), " ", CASE_STATUS_LABELS[selectedCase.status]] }), _jsxs("p", { children: [_jsx("strong", { children: "Relato inicial:" }), " ", selectedCase.initialNarrative] })] }), _jsx(CaseStatusControl, { status: selectedCase.status, items: selectedCaseItems, criticalReviewComplete: criticalReviewComplete, openBlockers: openBlockers, humanSeverity: severityAssessment.severity, onStatusChange: handleStatusChange }), _jsx(CanvasPage, { caseId: selectedCase.id, initialNarrative: selectedCase.initialNarrative, caseStatus: selectedCase.status, aiProvider: provider, onItemsChange: (nextItems) => {
                        setSelectedCaseItems(nextItems);
                        if (selectedCase.status === "DRAFT") {
                            const hasUserValidatedOrEditedItem = nextItems.some((item) => item.origin === "USER" && (item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED"));
                            const transition = canTransition("DRAFT", "IN_ANALYSIS", {
                                hasUserValidatedOrEditedItem,
                                hasMinimumCoverage: false,
                                startCriticalReviewRequested: false,
                                criticalReviewComplete: false,
                                criticalBlockers: 0,
                                humanSeverity: "UNASSESSED",
                                briefExists: false,
                                briefReviewed: false,
                                humanApproved: false
                            });
                            if (transition.allowed) {
                                updateDecisionCaseStatus(selectedCase.id, "IN_ANALYSIS");
                                refresh();
                            }
                        }
                    } }), _jsx(CriticalReviewPanel, { caseId: selectedCase.id, initialNarrative: selectedCase.initialNarrative, caseStatus: selectedCase.status, items: selectedCaseItems, provider: provider, onItemsUpdated: refresh }), shouldRenderHumanSeverityPanel ? (_jsx(HumanSeverityPanel, { caseId: selectedCase.id, caseStatus: selectedCase.status, criticalReviewComplete: criticalReviewComplete, hasMinimumCoverage: coverage.hasMinimumCoverage, missingCoverageLabels: mapMissingCoverageLabels(coverage.missingDimensions), openBlockers: openBlockers, openWarnings: openWarnings, onSaved: () => {
                        refresh();
                    }, onContinueToBriefDraft: () => {
                        const gate = canAdvanceToBriefDraft({
                            currentStatus: "HUMAN_EVALUATION",
                            hasMinimumCoverage: coverage.hasMinimumCoverage,
                            criticalReviewComplete,
                            openBlockers,
                            humanSeverity: getHumanSeverityAssessment(selectedCase.id).severity
                        });
                        if (gate.allowed) {
                            handleStatusChange("BRIEF_DRAFT");
                        }
                    } })) : null, shouldRenderBriefWorkspace ? (_jsx(BriefWorkspace, { decisionCase: selectedCase, items: selectedCaseItems, hasMinimumCoverage: coverage.hasMinimumCoverage, criticalReviewComplete: criticalReviewComplete, review: review, openBlockers: openBlockers, openWarnings: openWarnings, severityAssessment: severityAssessment, provider: provider, onBriefSaved: () => {
                        setBriefError(null);
                        refresh();
                    }, onError: (message) => {
                        setBriefError(message);
                    }, onReadyToEscalate: () => {
                        const currentApproval = getHumanBriefApproval(selectedCase.id);
                        const transition = canTransition("BRIEF_DRAFT", "READY_TO_ESCALATE", {
                            hasUserValidatedOrEditedItem: true,
                            hasMinimumCoverage: coverage.hasMinimumCoverage,
                            startCriticalReviewRequested: true,
                            criticalReviewComplete,
                            criticalBlockers: openBlockers,
                            humanSeverity: severityAssessment.severity,
                            briefExists: true,
                            briefReviewed: getBriefRecord(selectedCase.id).current?.reviewedByUser ?? false,
                            humanApproved: Boolean(currentApproval?.status === "APPROVED")
                        });
                        if (transition.allowed) {
                            handleStatusChange("READY_TO_ESCALATE");
                        }
                        else {
                            setBriefError("No se pudo completar la transición a Listo para elevar.");
                        }
                    } })) : null, briefError ? (_jsx("p", { className: "dw-inbox__alert", role: "alert", children: briefError })) : null, _jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                        setViewMode("inbox");
                        refresh();
                    }, children: "Volver al Inbox" })] }));
    }
    return (_jsxs("section", { className: "dw-inbox", children: [_jsxs("div", { className: "dw-inbox__header", children: [_jsx("h2", { children: "Inbox" }), !showCreateForm ? (_jsx(Button, { type: "button", onClick: () => setShowCreateForm(true), children: "Nuevo caso" })) : null] }), showCreateForm ? (_jsx(CaseForm, { onCancel: () => setShowCreateForm(false), onCreate: (payload) => {
                    createDecisionCase(payload);
                    setShowCreateForm(false);
                    refresh();
                } })) : null, items.length === 0 ? _jsx("p", { className: "dw-inbox__empty", children: "No hay casos cargados." }) : null, items.length > 0 ? (_jsxs("table", { className: "dw-inbox__table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "T\u00EDtulo" }), _jsx("th", { children: "Estado" }), _jsx("th", { children: "Actualizado" }), _jsx("th", { children: "Acci\u00F3n" })] }) }), _jsx("tbody", { children: items.map((item) => (_jsxs("tr", { children: [_jsx("td", { children: item.title }), _jsx("td", { children: CASE_STATUS_LABELS[item.status] }), _jsx("td", { children: formatUpdatedAt(item.updatedAt) }), _jsxs("td", { className: "dw-inbox__actions", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                                                setSelectedCaseId(item.id);
                                                setSelectedCaseItems(listCanvasItemsByCase(item.id));
                                                setViewMode("detail");
                                            }, children: "Abrir" }), _jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                                                const confirmed = window.confirm(`¿Eliminar el caso \"${item.title}\"?`);
                                                if (!confirmed) {
                                                    return;
                                                }
                                                deleteDecisionCase(item.id);
                                                if (selectedCaseId === item.id) {
                                                    setSelectedCaseId(null);
                                                    setSelectedCaseItems([]);
                                                    setViewMode("inbox");
                                                }
                                                refresh();
                                            }, children: "Eliminar" })] })] }, item.id))) })] })) : null] }));
}

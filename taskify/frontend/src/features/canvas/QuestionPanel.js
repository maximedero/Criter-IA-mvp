import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { CANVAS_DIMENSION_LABELS } from "../../domain/models/CanvasItem";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import { createPersistedQuestion, canRequestNextQuestion, missingCoverage } from "../../domain/workflow/questionLoop";
import { answerActiveQuestion, declareNoRelevantUncertainty, supersedeActiveQuestionIfCovered } from "../../domain/workflow/questionResponses";
import { findActiveQuestion, getAiQuestionSession, setActiveQuestion, setStopResult } from "../../providers/storage/aiSessionStorage";
import { parseSuggestNextQuestionResult } from "../../providers/ai";
import { QuestionResponseActions } from "./QuestionResponseActions";
function statusAllowsQuestion(status) {
    return status === "DRAFT" || status === "IN_ANALYSIS";
}
function toCoveredCanvasDimensions(items) {
    return items
        .filter((item) => item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED")
        .map((item) => item.dimension);
}
export function QuestionPanel({ caseId, initialNarrative, caseStatus, items, provider, onItemsUpdated }) {
    const [requesting, setRequesting] = useState(false);
    const [answering, setAnswering] = useState(false);
    const [error, setError] = useState(null);
    const [answerText, setAnswerText] = useState("");
    const [localMessage, setLocalMessage] = useState(null);
    const coverage = useMemo(() => evaluateMinimumCoverage(items), [items]);
    const session = getAiQuestionSession(caseId);
    const activeQuestion = findActiveQuestion(caseId);
    const selectedEpistemicType = activeQuestion?.suggestedEpistemicType ?? "INFERENCE";
    if (!statusAllowsQuestion(caseStatus)) {
        return null;
    }
    return (_jsxs("section", { "aria-label": "Asistencia contextual", children: [_jsx("h4", { children: "ASISTENCIA CONTEXTUAL" }), _jsx("button", { type: "button", onClick: async () => {
                    setError(null);
                    setLocalMessage(null);
                    if (!canRequestNextQuestion(activeQuestion)) {
                        setLocalMessage("Ya existe una pregunta activa.");
                        return;
                    }
                    setRequesting(true);
                    try {
                        const raw = await provider.suggestNextQuestion({
                            caseId,
                            initialNarrative,
                            currentItems: items,
                            coverageResult: coverage,
                            previousQuestions: session.questions,
                            questionCount: session.questionCount,
                            currentCaseStatus: caseStatus
                        });
                        const result = parseSuggestNextQuestionResult(raw);
                        if (result.shouldStop) {
                            setStopResult(caseId, result);
                            setLocalMessage(result.message);
                            return;
                        }
                        const persisted = createPersistedQuestion(caseId, result.question);
                        setActiveQuestion(caseId, persisted);
                        setAnswerText("");
                        setLocalMessage("Pregunta activa cargada.");
                        onItemsUpdated();
                    }
                    catch {
                        setError("No se pudo obtener la siguiente pregunta.");
                    }
                    finally {
                        setRequesting(false);
                    }
                }, disabled: requesting, children: "Obtener siguiente pregunta" }), session.lastStop?.message ? _jsx("p", { children: session.lastStop.message }) : null, localMessage ? _jsx("p", { children: localMessage }) : null, error ? _jsx("p", { role: "alert", children: error }) : null, activeQuestion ? (_jsxs("section", { children: [_jsx("h5", { children: "Pregunta activa" }), _jsxs("p", { children: [_jsx("strong", { children: "Dimensi\u00F3n:" }), " ", CANVAS_DIMENSION_LABELS[activeQuestion.targetDimension]] }), _jsxs("p", { children: [_jsx("strong", { children: "Pregunta:" }), " ", activeQuestion.question] }), _jsxs("p", { children: [_jsx("strong", { children: "Por qu\u00E9 importa:" }), " ", activeQuestion.reason] }), _jsx(QuestionResponseActions, { question: activeQuestion, answering: answering, error: error, answerText: answerText, selectedEpistemicType: selectedEpistemicType, onAnswerTextChange: setAnswerText, onEpistemicTypeChange: () => {
                            // optional override left for future
                        }, onDeclareNoUncertainty: () => {
                            setError(null);
                            const created = declareNoRelevantUncertainty(caseId);
                            supersedeActiveQuestionIfCovered(caseId, [created.dimension]);
                            setLocalMessage("Se registró la ausencia de incertidumbres relevantes.");
                            onItemsUpdated();
                        }, onAction: (action) => {
                            setError(null);
                            setAnswering(true);
                            try {
                                const result = answerActiveQuestion(caseId, {
                                    action,
                                    answerText,
                                    selectedEpistemicType
                                });
                                if (result.createdItem) {
                                    supersedeActiveQuestionIfCovered(caseId, [result.createdItem.dimension]);
                                }
                                setAnswerText("");
                                setLocalMessage("Respuesta registrada.");
                                onItemsUpdated();
                            }
                            catch (err) {
                                setError(err instanceof Error ? err.message : "No se pudo registrar la respuesta.");
                            }
                            finally {
                                setAnswering(false);
                            }
                        } })] })) : null, !activeQuestion && session.questions.length > 0 ? (_jsx("button", { type: "button", onClick: async () => {
                    setError(null);
                    setLocalMessage(null);
                    setRequesting(true);
                    try {
                        const raw = await provider.suggestNextQuestion({
                            caseId,
                            initialNarrative,
                            currentItems: items,
                            coverageResult: evaluateMinimumCoverage(items),
                            previousQuestions: session.questions,
                            questionCount: session.questionCount,
                            currentCaseStatus: caseStatus
                        });
                        const result = parseSuggestNextQuestionResult(raw);
                        if (result.shouldStop) {
                            setStopResult(caseId, result);
                            setLocalMessage(result.message);
                        }
                        else {
                            const persisted = createPersistedQuestion(caseId, result.question);
                            setActiveQuestion(caseId, persisted);
                            setLocalMessage("Pregunta activa cargada.");
                            onItemsUpdated();
                        }
                    }
                    catch {
                        setError("No se pudo obtener la siguiente pregunta.");
                    }
                    finally {
                        setRequesting(false);
                    }
                }, disabled: requesting || coverage.hasMinimumCoverage, children: "Siguiente pregunta" })) : null, _jsxs("p", { children: ["Cobertura actual: ", coverage.coveredCount, " de ", coverage.requiredCount] }), _jsxs("p", { children: ["Dimensiones faltantes: ", missingCoverage(coverage).join(", ") || "Ninguna"] })] }));
}

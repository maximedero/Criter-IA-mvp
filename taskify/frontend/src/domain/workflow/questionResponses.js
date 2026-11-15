import { createCanvasItemWithMetadata, listCanvasItemsByCase, updateCanvasItemWithMetadata } from "../../providers/storage/canvasStorage";
import { findActiveQuestion, updateQuestionStatus } from "../../providers/storage/aiSessionStorage";
import { inferQuestionStatus, mapDontKnowTemplate, validateAnswerOptionAllowed } from "./questionLoop";
function resolveEpistemicType(question, selected) {
    return selected ?? question.suggestedEpistemicType;
}
export function answerActiveQuestion(caseId, payload) {
    const active = findActiveQuestion(caseId);
    if (!active) {
        throw new Error("no active question");
    }
    validateAnswerOptionAllowed(active.answerOptions, payload.action);
    if (payload.action === "ANSWER") {
        const content = payload.answerText?.trim() ?? "";
        if (!content) {
            throw new Error("answer is required");
        }
        const created = createCanvasItemWithMetadata({
            caseId,
            dimension: active.targetDimension,
            content,
            epistemicType: resolveEpistemicType(active, payload.selectedEpistemicType)
        }, {
            origin: "USER",
            validationStatus: "VALIDATED"
        });
        updateQuestionStatus(caseId, active.id, inferQuestionStatus(payload.action), created.id);
        return { createdItem: created };
    }
    if (payload.action === "DONT_KNOW") {
        const content = mapDontKnowTemplate(active.targetDimension);
        const created = createCanvasItemWithMetadata({
            caseId,
            dimension: "UNCERTAINTY",
            content,
            epistemicType: "MISSING_INFORMATION"
        }, {
            origin: "USER",
            validationStatus: "VALIDATED"
        });
        updateQuestionStatus(caseId, active.id, inferQuestionStatus(payload.action), created.id);
        return { createdItem: created };
    }
    if (payload.action === "NOT_APPLICABLE") {
        updateQuestionStatus(caseId, active.id, inferQuestionStatus(payload.action));
        return { createdItem: null };
    }
    updateQuestionStatus(caseId, active.id, inferQuestionStatus(payload.action));
    return { createdItem: null };
}
export function declareNoRelevantUncertainty(caseId) {
    const existing = listCanvasItemsByCase(caseId);
    const existingDeclaration = existing.find((item) => item.dimension === "UNCERTAINTY" &&
        item.origin === "USER" &&
        item.validationStatus === "VALIDATED" &&
        item.epistemicType === "HUMAN_EVALUATION" &&
        item.content === "No identifico incertidumbres relevantes con la información disponible.");
    if (existingDeclaration) {
        return existingDeclaration;
    }
    return createCanvasItemWithMetadata({
        caseId,
        dimension: "UNCERTAINTY",
        content: "No identifico incertidumbres relevantes con la información disponible.",
        epistemicType: "HUMAN_EVALUATION"
    }, {
        origin: "USER",
        validationStatus: "VALIDATED"
    });
}
export function supersedeActiveQuestionIfCovered(caseId, coveredDimensions) {
    const active = findActiveQuestion(caseId);
    if (!active) {
        return;
    }
    if (coveredDimensions.includes(active.targetDimension)) {
        updateQuestionStatus(caseId, active.id, "SUPERSEDED");
    }
}
export function patchQuestionResultingItem(caseId, questionId, itemId) {
    const items = listCanvasItemsByCase(caseId);
    const target = items.find((item) => item.id === itemId);
    if (!target) {
        throw new Error("canvas item not found for question link");
    }
    updateQuestionStatus(caseId, questionId, "ANSWERED", itemId);
    updateCanvasItemWithMetadata(caseId, itemId, {
        content: target.content,
        epistemicType: target.epistemicType
    }, {
        validationStatus: target.validationStatus
    });
}

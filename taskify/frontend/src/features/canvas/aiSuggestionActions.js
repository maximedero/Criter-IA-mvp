import { createCanvasItemWithMetadata, listCanvasItemsByCase, updateCanvasItemWithMetadata } from "../../providers/storage/canvasStorage";
function normalizeText(value) {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
}
function sameSuggestionContent(existing, suggestion) {
    return existing.dimension === suggestion.dimension && normalizeText(existing.content) === normalizeText(suggestion.content);
}
export function applyAnalyzeNarrativeSuggestions(caseId, suggestions) {
    const existing = listCanvasItemsByCase(caseId);
    for (const suggestion of suggestions) {
        const sameBySuggestionId = existing.find((item) => item.origin === "AI" && item.aiSuggestion?.suggestionId === suggestion.id);
        if (sameBySuggestionId) {
            continue;
        }
        const sameActive = existing.find((item) => item.origin === "AI" &&
            item.validationStatus !== "REJECTED" &&
            sameSuggestionContent(item, suggestion));
        if (sameActive) {
            continue;
        }
        const sameRejected = existing.find((item) => item.origin === "AI" &&
            item.validationStatus === "REJECTED" &&
            sameSuggestionContent(item, suggestion));
        if (sameRejected) {
            continue;
        }
        createCanvasItemWithMetadata({
            caseId,
            dimension: suggestion.dimension,
            content: suggestion.content,
            epistemicType: suggestion.epistemicType
        }, {
            origin: "AI",
            validationStatus: "PENDING",
            aiSuggestion: {
                suggestionId: suggestion.id,
                rationale: suggestion.rationale,
                source: suggestion.source,
                originalContent: suggestion.content
            }
        });
    }
}
export function acceptAISuggestion(caseId, itemId) {
    const items = listCanvasItemsByCase(caseId);
    const target = items.find((item) => item.id === itemId);
    if (!target || target.origin !== "AI" || target.validationStatus !== "PENDING") {
        throw new Error("ai suggestion not pending");
    }
    updateCanvasItemWithMetadata(caseId, itemId, {
        content: target.content,
        epistemicType: target.epistemicType
    }, {
        validationStatus: "VALIDATED"
    });
}
export function editAISuggestion(caseId, itemId, editedContent) {
    const items = listCanvasItemsByCase(caseId);
    const target = items.find((item) => item.id === itemId);
    if (!target || target.origin !== "AI" || target.validationStatus !== "PENDING") {
        throw new Error("ai suggestion not pending");
    }
    updateCanvasItemWithMetadata(caseId, itemId, {
        content: editedContent,
        epistemicType: target.epistemicType
    }, {
        validationStatus: "EDITED"
    });
}
export function rejectAISuggestion(caseId, itemId) {
    const items = listCanvasItemsByCase(caseId);
    const target = items.find((item) => item.id === itemId);
    if (!target || target.origin !== "AI" || target.validationStatus !== "PENDING") {
        throw new Error("ai suggestion not pending");
    }
    updateCanvasItemWithMetadata(caseId, itemId, {
        content: target.content,
        epistemicType: target.epistemicType
    }, {
        validationStatus: "REJECTED"
    });
}

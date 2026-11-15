import { isValidCanvasDimension, isValidEpistemicType } from "../../domain/models/CanvasItem";
const STORAGE_KEY = "dw.canvas";
function parseCanvasMap(raw) {
    if (!raw) {
        return {};
    }
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
    }
    catch {
        return {};
    }
}
function loadCanvasMap() {
    return parseCanvasMap(localStorage.getItem(STORAGE_KEY));
}
function writeCanvasMap(value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
function nextId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return `canvas-item-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}
function assertCaseId(caseId) {
    const trimmed = caseId.trim();
    if (!trimmed) {
        throw new Error("caseId is required");
    }
    return trimmed;
}
function assertContent(content) {
    const trimmed = content.trim();
    if (!trimmed) {
        throw new Error("content is required");
    }
    return trimmed;
}
export function listCanvasItemsByCase(caseId) {
    const safeCaseId = assertCaseId(caseId);
    const map = loadCanvasMap();
    return [...(map[safeCaseId] ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
export function createCanvasItem(input) {
    return createCanvasItemWithMetadata(input, undefined);
}
export function createCanvasItemWithMetadata(input, options) {
    const caseId = assertCaseId(input.caseId);
    const content = assertContent(input.content);
    if (!isValidCanvasDimension(input.dimension)) {
        throw new Error("dimension is invalid");
    }
    if (!isValidEpistemicType(input.epistemicType)) {
        throw new Error("epistemicType is invalid");
    }
    const map = loadCanvasMap();
    const now = new Date().toISOString();
    const created = {
        id: nextId(),
        caseId,
        dimension: input.dimension,
        content,
        epistemicType: input.epistemicType,
        origin: options?.origin ?? "USER",
        validationStatus: options?.validationStatus ?? "VALIDATED",
        aiSuggestion: options?.aiSuggestion,
        createdAt: now,
        updatedAt: now
    };
    const list = map[caseId] ?? [];
    map[caseId] = [...list, created];
    writeCanvasMap(map);
    return created;
}
export function updateCanvasItem(caseId, itemId, input) {
    return updateCanvasItemWithMetadata(caseId, itemId, input, undefined);
}
export function updateCanvasItemWithMetadata(caseId, itemId, input, options) {
    const safeCaseId = assertCaseId(caseId);
    const safeItemId = itemId.trim();
    const content = assertContent(input.content);
    if (!safeItemId) {
        throw new Error("itemId is required");
    }
    if (!isValidEpistemicType(input.epistemicType)) {
        throw new Error("epistemicType is invalid");
    }
    const map = loadCanvasMap();
    const list = map[safeCaseId] ?? [];
    const index = list.findIndex((item) => item.id === safeItemId);
    if (index < 0) {
        throw new Error("canvas item not found");
    }
    const current = list[index];
    const updated = {
        ...current,
        content,
        epistemicType: input.epistemicType,
        validationStatus: options?.validationStatus ?? "EDITED",
        updatedAt: new Date().toISOString()
    };
    const next = [...list];
    next[index] = updated;
    map[safeCaseId] = next;
    writeCanvasMap(map);
    return updated;
}
export function deleteCanvasItem(caseId, itemId) {
    const safeCaseId = assertCaseId(caseId);
    const safeItemId = itemId.trim();
    if (!safeItemId) {
        throw new Error("itemId is required");
    }
    const map = loadCanvasMap();
    const list = map[safeCaseId] ?? [];
    map[safeCaseId] = list.filter((item) => item.id !== safeItemId);
    writeCanvasMap(map);
}
export function clearCanvasForTests() {
    localStorage.removeItem(STORAGE_KEY);
}

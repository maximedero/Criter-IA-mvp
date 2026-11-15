import {
  type CanvasItem,
  type CreateCanvasItemInput,
  type UpdateCanvasItemInput,
  isValidCanvasDimension,
  isValidEpistemicType
} from "../../domain/models/CanvasItem";

const STORAGE_KEY = "dw.canvas";

type CanvasMap = Record<string, CanvasItem[]>;

function parseCanvasMap(raw: string | null): CanvasMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as CanvasMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function loadCanvasMap(): CanvasMap {
  return parseCanvasMap(localStorage.getItem(STORAGE_KEY));
}

function writeCanvasMap(value: CanvasMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function nextId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `canvas-item-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

function assertCaseId(caseId: string): string {
  const trimmed = caseId.trim();

  if (!trimmed) {
    throw new Error("caseId is required");
  }

  return trimmed;
}

function assertContent(content: string): string {
  const trimmed = content.trim();

  if (!trimmed) {
    throw new Error("content is required");
  }

  return trimmed;
}

export function listCanvasItemsByCase(caseId: string): CanvasItem[] {
  const safeCaseId = assertCaseId(caseId);
  const map = loadCanvasMap();

  return [...(map[safeCaseId] ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function createCanvasItem(input: CreateCanvasItemInput): CanvasItem {
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

  const created: CanvasItem = {
    id: nextId(),
    caseId,
    dimension: input.dimension,
    content,
    epistemicType: input.epistemicType,
    origin: "USER",
    validationStatus: "VALIDATED",
    createdAt: now,
    updatedAt: now
  };

  const list = map[caseId] ?? [];
  map[caseId] = [...list, created];

  writeCanvasMap(map);

  return created;
}

export function updateCanvasItem(caseId: string, itemId: string, input: UpdateCanvasItemInput): CanvasItem {
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
  const updated: CanvasItem = {
    ...current,
    content,
    epistemicType: input.epistemicType,
    validationStatus: "EDITED",
    updatedAt: new Date().toISOString()
  };

  const next = [...list];
  next[index] = updated;
  map[safeCaseId] = next;
  writeCanvasMap(map);

  return updated;
}

export function deleteCanvasItem(caseId: string, itemId: string): void {
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

export function clearCanvasForTests(): void {
  localStorage.removeItem(STORAGE_KEY);
}

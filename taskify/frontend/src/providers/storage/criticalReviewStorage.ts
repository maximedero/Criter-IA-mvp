import type {
  CriticalReview,
  CriticalReviewStatus,
  ReviewCaseResult,
  ReviewFinding,
  ReviewFindingStatus
} from "../../domain/models/CriticalReview";

const STORAGE_KEY = "dw.criticalReviews";
const REVIEW_FLAG_KEY = "dw.criticalReviewComplete";

type ReviewMap = Record<string, CriticalReview[]>;
type ReviewCompleteMap = Record<string, boolean>;

function parseReviewMap(raw: string | null): ReviewMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as ReviewMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function parseReviewCompleteMap(raw: string | null): ReviewCompleteMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as ReviewCompleteMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function loadMap(): ReviewMap {
  return parseReviewMap(localStorage.getItem(STORAGE_KEY));
}

function writeMap(value: ReviewMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function loadReviewCompleteMap(): ReviewCompleteMap {
  return parseReviewCompleteMap(localStorage.getItem(REVIEW_FLAG_KEY));
}

function writeReviewCompleteMap(value: ReviewCompleteMap): void {
  localStorage.setItem(REVIEW_FLAG_KEY, JSON.stringify(value));
}

function nowIso(): string {
  return new Date().toISOString();
}

export function persistReviewResult(caseId: string, result: ReviewCaseResult): CriticalReview {
  const map = loadMap();
  const list = map[caseId] ?? [];

  const persisted: CriticalReview = {
    reviewId: result.reviewId,
    caseId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    findings: result.findings,
    summary: result.summary,
    canCompleteReview: result.canCompleteReview,
    status: "IN_PROGRESS"
  };

  map[caseId] = [...list, persisted];
  writeMap(map);
  setCriticalReviewCompleteFlag(caseId, false);

  return persisted;
}

export function saveCriticalReview(review: CriticalReview): void {
  const map = loadMap();
  const list = map[review.caseId] ?? [];
  const index = list.findIndex((item) => item.reviewId === review.reviewId);

  if (index < 0) {
    map[review.caseId] = [...list, review];
  } else {
    const next = [...list];
    next[index] = {
      ...review,
      updatedAt: nowIso()
    };
    map[review.caseId] = next;
  }

  writeMap(map);
}

export function listCriticalReviews(caseId: string): CriticalReview[] {
  const map = loadMap();
  return [...(map[caseId] ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function getCriticalReview(caseId: string): CriticalReview | null {
  const list = listCriticalReviews(caseId);
  if (list.length === 0) {
    return null;
  }

  return list[list.length - 1];
}

export type UpdateReviewInput = {
  status?: CriticalReviewStatus;
  summary?: CriticalReview["summary"];
  findings?: ReviewFinding[];
  canCompleteReview?: boolean;
  completedAt?: string;
};

export function updateReview(caseId: string, updates: UpdateReviewInput): CriticalReview {
  const current = getCriticalReview(caseId);
  if (!current) {
    throw new Error("review not found");
  }

  const next: CriticalReview = {
    ...current,
    ...updates,
    updatedAt: nowIso()
  };

  saveCriticalReview(next);

  if (next.status === "COMPLETED") {
    setCriticalReviewCompleteFlag(caseId, true);
  }

  return next;
}

export type UpdateFindingInput = {
  status?: ReviewFindingStatus;
  clarification?: string;
  dismissReason?: string;
  resultingCanvasItemId?: string;
  resolvedAt?: string;
};

export function updateFinding(caseId: string, findingId: string, updates: UpdateFindingInput): CriticalReview {
  const review = getCriticalReview(caseId);
  if (!review) {
    throw new Error("review not found");
  }

  const index = review.findings.findIndex((item) => item.id === findingId);
  if (index < 0) {
    throw new Error("finding not found");
  }

  const current = review.findings[index];
  const updatedFinding: ReviewFinding = {
    ...current,
    ...updates
  };

  const nextFindings = [...review.findings];
  nextFindings[index] = updatedFinding;

  const nextReview: CriticalReview = {
    ...review,
    findings: nextFindings,
    updatedAt: nowIso()
  };

  saveCriticalReview(nextReview);
  return nextReview;
}

export function setCriticalReviewCompleteFlag(caseId: string, value: boolean): void {
  const map = loadReviewCompleteMap();
  map[caseId] = value;
  writeReviewCompleteMap(map);
}

export function isCriticalReviewComplete(caseId: string): boolean {
  const map = loadReviewCompleteMap();
  return Boolean(map[caseId]);
}

export function clearCriticalReviewsForTests(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(REVIEW_FLAG_KEY);
}

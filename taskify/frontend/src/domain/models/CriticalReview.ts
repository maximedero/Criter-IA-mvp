import type { CaseStatus } from "./CaseStatus";
import type { CanvasItem } from "./CanvasItem";
import type { CoverageResult } from "./CoverageResult";
import type { PersistedQuestion } from "./ContextualQuestion";

export const REVIEW_FINDING_TYPES = [
  "UNSUPPORTED_CLAIM",
  "HIDDEN_ASSUMPTION",
  "POTENTIAL_CONTRADICTION",
  "UNCERTAINTY_NOT_VISIBLE",
  "INTERVENTION_NOT_ACTIONABLE",
  "EVIDENCE_GAP",
  "COMPARABILITY_GAP",
  "OTHER_REVIEW_CONCERN"
] as const;
export type ReviewFindingType = (typeof REVIEW_FINDING_TYPES)[number];

export const REVIEW_FINDING_LEVELS = ["BLOCKER", "WARNING"] as const;
export type ReviewFindingLevel = (typeof REVIEW_FINDING_LEVELS)[number];

export const REVIEW_FINDING_STATUSES = [
  "OPEN",
  "RESOLVED_BY_EDIT",
  "RESOLVED_BY_CLARIFICATION",
  "ACKNOWLEDGED_AS_UNCERTAINTY",
  "DISMISSED_BY_USER",
  "SUPERSEDED"
] as const;
export type ReviewFindingStatus = (typeof REVIEW_FINDING_STATUSES)[number];

export const CRITICAL_REVIEW_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
export type CriticalReviewStatus = (typeof CRITICAL_REVIEW_STATUSES)[number];

export type ReviewSummary = {
  totalFindings: number;
  openBlockers: number;
  openWarnings: number;
  resolvedFindings: number;
};

export type ReviewFinding = {
  id: string;
  type: ReviewFindingType;
  level: ReviewFindingLevel;
  title: string;
  message: string;
  relatedItemIds: string[];
  rationale: string;
  suggestedHumanAction: string;
  status: ReviewFindingStatus;
  clarification?: string;
  dismissReason?: string;
  resultingCanvasItemId?: string;
  resolvedAt?: string;
};

export type ReviewCaseInput = {
  caseId: string;
  initialNarrative: string;
  currentItems: CanvasItem[];
  rejectedAiItems: CanvasItem[];
  coverageResult: CoverageResult;
  contextualQuestionHistory: PersistedQuestion[];
  currentCaseStatus: CaseStatus;
};

export type ReviewCaseResult = {
  reviewId: string;
  findings: ReviewFinding[];
  summary: ReviewSummary;
  canCompleteReview: boolean;
};

export type CriticalReview = {
  reviewId: string;
  caseId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  findings: ReviewFinding[];
  summary: ReviewSummary;
  canCompleteReview: boolean;
  status: CriticalReviewStatus;
};

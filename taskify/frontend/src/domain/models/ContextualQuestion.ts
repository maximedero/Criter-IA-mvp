import type { CaseStatus } from "./CaseStatus";
import type { CanvasDimension, EpistemicType } from "./CanvasItem";
import type { CoverageDimension, CoverageResult } from "./CoverageResult";

export const QUESTION_PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export type QuestionPriority = (typeof QUESTION_PRIORITIES)[number];

export const QUESTION_ANSWER_OPTIONS = ["ANSWER", "DONT_KNOW", "NOT_APPLICABLE", "SKIP_FOR_NOW"] as const;
export type QuestionAnswerOption = (typeof QUESTION_ANSWER_OPTIONS)[number];

export const STOP_REASONS = [
  "MINIMUM_COVERAGE_REACHED",
  "ORIENTATIVE_LIMIT_REACHED",
  "EXTERNAL_RESEARCH_REQUIRED",
  "USER_STOPPED",
  "NO_MATERIAL_QUESTION",
  "NO_MORE_INFORMATION"
] as const;
export type StopReason = (typeof STOP_REASONS)[number];

export const QUESTION_STATUSES = ["ACTIVE", "ANSWERED", "DONT_KNOW", "NOT_APPLICABLE", "SKIPPED", "SUPERSEDED"] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export type DynamicQuestion = {
  id: string;
  targetDimension: CanvasDimension;
  question: string;
  reason: string;
  priority: QuestionPriority;
  suggestedEpistemicType: EpistemicType;
  answerOptions: QuestionAnswerOption[];
};

export type PersistedQuestion = DynamicQuestion & {
  caseId: string;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  answeredAt?: string;
  resultingCanvasItemId?: string;
};

export type SuggestNextQuestionResult = {
  question: DynamicQuestion | null;
  shouldStop: boolean;
  stopReason: StopReason | null;
  remainingMissingDimensions: CoverageDimension[];
  provisionalBriefAllowed: boolean;
  message: string | null;
};

export type SuggestNextQuestionInput = {
  caseId: string;
  initialNarrative: string;
  currentItems: import("./CanvasItem").CanvasItem[];
  coverageResult: CoverageResult;
  previousQuestions: PersistedQuestion[];
  questionCount: number;
  currentCaseStatus: CaseStatus;
};

export type AiQuestionSession = {
  caseId: string;
  questionCount: number;
  questions: PersistedQuestion[];
  lastStop: SuggestNextQuestionResult | null;
  userStopped: boolean;
  updatedAt: string;
};

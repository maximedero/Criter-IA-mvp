import type {
  AISuggestionSource,
  CanvasDimension,
  CanvasItem,
  EpistemicType
} from "../../domain/models/CanvasItem";
import type {
  DynamicQuestion,
  SuggestNextQuestionInput,
  SuggestNextQuestionResult
} from "../../domain/models/ContextualQuestion";
import type {
  ReviewCaseInput,
  ReviewCaseResult
} from "../../domain/models/CriticalReview";

export type AnalyzeNarrativeInput = {
  caseId: string;
  initialNarrative: string;
  existingItems: CanvasItem[];
};

export type AISuggestion = {
  id: string;
  dimension: CanvasDimension;
  epistemicType: EpistemicType;
  content: string;
  rationale: string;
  source: AISuggestionSource;
};

export type AnalyzeNarrativeResult = {
  suggestions: AISuggestion[];
};

export type { SuggestNextQuestionInput, SuggestNextQuestionResult, DynamicQuestion };

export type { ReviewCaseInput, ReviewCaseResult };

export type GenerateBriefInput = {
  caseId: string;
  items: CanvasItem[];
};

export type GenerateBriefResult = {
  executiveSummary: string;
  expandedSummary: string;
};

export interface AIProvider {
  analyzeNarrative(input: AnalyzeNarrativeInput): Promise<AnalyzeNarrativeResult>;
  suggestNextQuestion(input: SuggestNextQuestionInput): Promise<SuggestNextQuestionResult>;
  reviewCase(input: ReviewCaseInput): Promise<ReviewCaseResult>;
  generateBrief(input: GenerateBriefInput): Promise<GenerateBriefResult>;
}

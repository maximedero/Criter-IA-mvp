import type { CaseStatus, HumanSeverity } from "./CaseStatus";
import type { CanvasDimension, CanvasItem, CanvasItemOrigin, CanvasItemValidationStatus, EpistemicType } from "./CanvasItem";
import type { HumanSeverityAssessment } from "./HumanSeverityAssessment";
import type { CriticalReview, ReviewFinding } from "./CriticalReview";
import type { PersistedQuestion } from "./ContextualQuestion";

export const BRIEF_STATUSES = ["NOT_GENERATED", "GENERATED", "EDITED_BY_USER", "REVIEWED_BY_USER"] as const;
export type BriefStatus = (typeof BRIEF_STATUSES)[number];

export const EXECUTIVE_SECTION_KEYS = [
  "situation",
  "whyItMatters",
  "possibleImpacts",
  "evidence",
  "uncertainties",
  "scenariosAndAlternatives",
  "requiredIntervention"
] as const;

export type ExecutiveSectionKey = (typeof EXECUTIVE_SECTION_KEYS)[number];

export type BriefSection = {
  content: string;
  sourceItemIds: string[];
  hasSufficientInformation: boolean;
  limitations: string[];
};

export type BriefSeveritySection = {
  value: HumanSeverity;
  label: string;
  rationale: string | null;
  assessedBy: "USER";
  assessedAt: string;
  notice: "Evaluación realizada por el usuario.";
};

export type ExecutiveBrief = {
  situation: BriefSection;
  whyItMatters: BriefSection;
  possibleImpacts: BriefSection;
  evidence: BriefSection;
  uncertainties: BriefSection;
  scenariosAndAlternatives: BriefSection;
  severity: BriefSeveritySection;
  requiredIntervention: BriefSection;
};

export type ExpandedBriefItem = {
  itemId: string;
  dimension: CanvasDimension;
  epistemicType: EpistemicType;
  origin: CanvasItemOrigin;
  validationStatus: CanvasItemValidationStatus;
  content: string;
};

export type BriefOpenWarning = {
  id: string;
  title: string;
  message: string;
  relatedItemIds: string[];
};

export type BriefResolvedFinding = {
  id: string;
  title: string;
  resolution: string;
  relatedItemIds: string[];
};

export type ExpandedBrief = {
  facts: ExpandedBriefItem[];
  inferences: ExpandedBriefItem[];
  assumptions: ExpandedBriefItem[];
  missingInformation: ExpandedBriefItem[];
  humanEvaluations: ExpandedBriefItem[];
  evidenceItems: ExpandedBriefItem[];
  openWarnings: BriefOpenWarning[];
  resolvedFindings: BriefResolvedFinding[];
  sources: string[];
  generationLimitations: string[];
};

export type BriefTraceability = {
  sectionSources: Record<ExecutiveSectionKey, string[]>;
  severityAssessmentRef: string;
  criticalReviewId: string;
  generatedFromCanvasUpdatedAt: string;
  generationProvider: "MockAIProvider";
  generationTimestamp: string;
  editedSections: ExecutiveSectionKey[];
  userReviewTimestamp?: string;
};

export type DecisionBrief = {
  id: string;
  caseId: string;
  version: number;
  status: BriefStatus;
  executive: ExecutiveBrief;
  expanded: ExpandedBrief;
  traceability: BriefTraceability;
  generatedBy: "AI";
  reviewedByUser: boolean;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
};

export type GenerateBriefInput = {
  caseId: string;
  caseTitle: string;
  initialNarrative: string;
  activeCanvasItems: CanvasItem[];
  humanSeverityAssessment: HumanSeverityAssessment;
  completedCriticalReview: CriticalReview;
  openWarnings: ReviewFinding[];
  contextualQuestionHistory: PersistedQuestion[];
  currentCaseStatus: CaseStatus;
};

export type GenerateBriefResult = DecisionBrief;

export type BriefRecord = {
  current: DecisionBrief | null;
  history: DecisionBrief[];
  stale: boolean;
};

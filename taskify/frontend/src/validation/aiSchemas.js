import { z } from "zod";
import { CRITICAL_REVIEW_STATUSES, REVIEW_FINDING_LEVELS, REVIEW_FINDING_STATUSES, REVIEW_FINDING_TYPES } from "../domain/models/CriticalReview";
const CANVAS_DIMENSIONS = [
    "CONTEXT",
    "EXPOSURE",
    "EVIDENCE",
    "IMPACT",
    "UNCERTAINTY",
    "SCENARIO",
    "ALTERNATIVE",
    "INTERVENTION"
];
const EPISTEMIC_TYPES = ["FACT", "INFERENCE", "ASSUMPTION", "MISSING_INFORMATION", "HUMAN_EVALUATION"];
const AI_SUGGESTION_SOURCES = ["INITIAL_NARRATIVE"];
const COVERAGE_DIMENSIONS = ["SITUATION", "EXPOSURE", "IMPACT", "EVIDENCE", "UNCERTAINTY", "INTERVENTION"];
const QUESTION_PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
const QUESTION_ANSWER_OPTIONS = ["ANSWER", "DONT_KNOW", "NOT_APPLICABLE", "SKIP_FOR_NOW"];
const STOP_REASONS = [
    "MINIMUM_COVERAGE_REACHED",
    "ORIENTATIVE_LIMIT_REACHED",
    "EXTERNAL_RESEARCH_REQUIRED",
    "USER_STOPPED",
    "NO_MATERIAL_QUESTION",
    "NO_MORE_INFORMATION"
];
const CASE_STATUSES = ["NEW", "DRAFT", "IN_ANALYSIS", "CRITICAL_REVIEW", "HUMAN_EVALUATION", "BRIEF_DRAFT", "READY_TO_ESCALATE"];
const QUESTION_STATUSES = ["ACTIVE", "ANSWERED", "DONT_KNOW", "NOT_APPLICABLE", "SKIPPED", "SUPERSEDED"];
const canvasItemSchema = z.object({
    id: z.string().min(1),
    caseId: z.string().min(1),
    dimension: z.enum(CANVAS_DIMENSIONS),
    content: z.string().min(1),
    epistemicType: z.enum(EPISTEMIC_TYPES),
    origin: z.enum(["USER", "AI"]),
    validationStatus: z.enum(["PENDING", "VALIDATED", "EDITED", "REJECTED"]),
    aiSuggestion: z
        .object({
        suggestionId: z.string().min(1),
        rationale: z.string().min(1),
        source: z.enum(AI_SUGGESTION_SOURCES),
        originalContent: z.string().min(1)
    })
        .optional(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1)
});
export const analyzeNarrativeInputSchema = z.object({
    caseId: z.string().min(1),
    initialNarrative: z.string().min(1),
    existingItems: z.array(canvasItemSchema)
});
export const aiSuggestionSchema = z.object({
    id: z.string().min(1),
    dimension: z.enum(CANVAS_DIMENSIONS),
    epistemicType: z.enum(EPISTEMIC_TYPES),
    content: z.string().min(1),
    rationale: z.string().min(1),
    source: z.enum(AI_SUGGESTION_SOURCES)
});
export const analyzeNarrativeResultSchema = z.object({
    suggestions: z.array(aiSuggestionSchema)
});
export const questionAnswerSchema = z.object({
    questionId: z.string().min(1),
    action: z.enum(QUESTION_ANSWER_OPTIONS),
    answerText: z.string().optional()
});
const dynamicQuestionBaseSchema = z.object({
    id: z.string().min(1),
    targetDimension: z.enum(CANVAS_DIMENSIONS),
    question: z.string().min(1),
    reason: z.string().min(1),
    priority: z.enum(QUESTION_PRIORITIES),
    suggestedEpistemicType: z.enum(EPISTEMIC_TYPES),
    answerOptions: z.array(z.enum(QUESTION_ANSWER_OPTIONS)).min(1)
});
const dynamicQuestionSchema = dynamicQuestionBaseSchema.superRefine((value, ctx) => {
    if (!value.answerOptions.includes("ANSWER")) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["answerOptions"],
            message: "ANSWER option is required"
        });
    }
    if (value.answerOptions.includes("NOT_APPLICABLE") &&
        ["CONTEXT", "EXPOSURE", "EVIDENCE", "IMPACT", "UNCERTAINTY", "INTERVENTION"].includes(value.targetDimension)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["answerOptions"],
            message: "NOT_APPLICABLE is not allowed for required dimensions"
        });
    }
});
export const persistedQuestionSchema = dynamicQuestionBaseSchema.extend({
    caseId: z.string().min(1),
    status: z.enum(QUESTION_STATUSES),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
    answeredAt: z.string().optional(),
    resultingCanvasItemId: z.string().optional()
});
export const suggestNextQuestionInputSchema = z.object({
    caseId: z.string().min(1),
    initialNarrative: z.string().min(1),
    currentItems: z.array(canvasItemSchema),
    coverageResult: z.object({
        coveredDimensions: z.array(z.enum(COVERAGE_DIMENSIONS)),
        missingDimensions: z.array(z.enum(COVERAGE_DIMENSIONS)),
        coveredCount: z.number().int().min(0),
        requiredCount: z.literal(6),
        hasMinimumCoverage: z.boolean()
    }),
    previousQuestions: z.array(persistedQuestionSchema),
    questionCount: z.number().int().min(0),
    currentCaseStatus: z.enum(CASE_STATUSES)
});
export const suggestNextQuestionResultSchema = z
    .object({
    question: dynamicQuestionSchema.nullable(),
    shouldStop: z.boolean(),
    stopReason: z.enum(STOP_REASONS).nullable(),
    remainingMissingDimensions: z.array(z.enum(COVERAGE_DIMENSIONS)),
    provisionalBriefAllowed: z.boolean(),
    message: z.string().nullable()
})
    .superRefine((value, ctx) => {
    if (!value.shouldStop && !value.question) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["question"], message: "question is required when shouldStop is false" });
    }
    if (value.shouldStop && value.question !== null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["question"], message: "question must be null when shouldStop is true" });
    }
    if (value.shouldStop && value.stopReason === null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["stopReason"], message: "stopReason is required when shouldStop is true" });
    }
    if (!value.shouldStop && value.stopReason !== null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["stopReason"], message: "stopReason must be null when shouldStop is false" });
    }
});
export const reviewFindingTypeSchema = z.enum(REVIEW_FINDING_TYPES);
export const reviewFindingLevelSchema = z.enum(REVIEW_FINDING_LEVELS);
export const reviewFindingStatusSchema = z.enum(REVIEW_FINDING_STATUSES);
export const criticalReviewStatusSchema = z.enum(CRITICAL_REVIEW_STATUSES);
export const reviewSummarySchema = z.object({
    totalFindings: z.number().int().min(0),
    openBlockers: z.number().int().min(0),
    openWarnings: z.number().int().min(0),
    resolvedFindings: z.number().int().min(0)
});
export const reviewFindingSchema = z.object({
    id: z.string().min(1),
    type: reviewFindingTypeSchema,
    level: reviewFindingLevelSchema,
    title: z.string().min(1),
    message: z.string().min(1),
    relatedItemIds: z.array(z.string().min(1)),
    rationale: z.string().min(1),
    suggestedHumanAction: z.string().min(1),
    status: reviewFindingStatusSchema,
    clarification: z.string().min(1).optional(),
    dismissReason: z.string().min(1).optional(),
    resultingCanvasItemId: z.string().min(1).optional(),
    resolvedAt: z.string().min(1).optional()
});
export const reviewCaseInputSchema = z.object({
    caseId: z.string().min(1),
    initialNarrative: z.string().min(1),
    currentItems: z.array(canvasItemSchema),
    rejectedAiItems: z.array(canvasItemSchema),
    coverageResult: z.object({
        coveredDimensions: z.array(z.enum(COVERAGE_DIMENSIONS)),
        missingDimensions: z.array(z.enum(COVERAGE_DIMENSIONS)),
        coveredCount: z.number().int().min(0),
        requiredCount: z.literal(6),
        hasMinimumCoverage: z.boolean()
    }),
    contextualQuestionHistory: z.array(persistedQuestionSchema),
    currentCaseStatus: z.enum(CASE_STATUSES)
});
export const reviewCaseResultSchema = z
    .object({
    reviewId: z.string().min(1),
    findings: z.array(reviewFindingSchema),
    summary: reviewSummarySchema,
    canCompleteReview: z.boolean()
})
    .superRefine((value, ctx) => {
    for (const finding of value.findings) {
        if (finding.status !== "OPEN") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["findings", finding.id, "status"],
                message: "new review findings must start as OPEN"
            });
        }
    }
});
export const generateBriefInputSchema = z.object({
    caseId: z.string().min(1),
    items: z.array(canvasItemSchema)
});
export const generateBriefResultSchema = z.object({
    executiveSummary: z.string(),
    expandedSummary: z.string()
});

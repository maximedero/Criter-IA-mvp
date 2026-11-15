import { analyzeNarrativeInputSchema, analyzeNarrativeResultSchema, generateBriefInputSchema, generateBriefResultSchema, reviewCaseInputSchema, reviewCaseResultSchema, suggestNextQuestionInputSchema, suggestNextQuestionResultSchema } from "../../validation/aiSchemas";
export function parseAnalyzeNarrativeInput(value) {
    return analyzeNarrativeInputSchema.parse(value);
}
export function parseAnalyzeNarrativeResult(value) {
    return analyzeNarrativeResultSchema.parse(value);
}
export function parseSuggestNextQuestionInput(value) {
    return suggestNextQuestionInputSchema.parse(value);
}
export function parseSuggestNextQuestionResult(value) {
    return suggestNextQuestionResultSchema.parse(value);
}
export function parseReviewCaseInput(value) {
    return reviewCaseInputSchema.parse(value);
}
export function parseReviewCaseResult(value) {
    return reviewCaseResultSchema.parse(value);
}
export function parseGenerateBriefInput(value) {
    return generateBriefInputSchema.parse(value);
}
export function parseGenerateBriefResult(value) {
    return generateBriefResultSchema.parse(value);
}

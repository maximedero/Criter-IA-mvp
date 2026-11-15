import {
  analyzeNarrativeInputSchema,
  analyzeNarrativeResultSchema,
  generateBriefInputSchema,
  generateBriefResultSchema,
  reviewCaseInputSchema,
  reviewCaseResultSchema,
  suggestNextQuestionInputSchema,
  suggestNextQuestionResultSchema
} from "../../validation/aiSchemas";
import type {
  AnalyzeNarrativeInput,
  AnalyzeNarrativeResult,
  GenerateBriefInput,
  GenerateBriefResult,
  ReviewCaseInput,
  ReviewCaseResult,
  SuggestNextQuestionInput,
  SuggestNextQuestionResult
} from "./AIProvider";

export function parseAnalyzeNarrativeInput(value: unknown): AnalyzeNarrativeInput {
  return analyzeNarrativeInputSchema.parse(value);
}

export function parseAnalyzeNarrativeResult(value: unknown): AnalyzeNarrativeResult {
  return analyzeNarrativeResultSchema.parse(value);
}

export function parseSuggestNextQuestionInput(value: unknown): SuggestNextQuestionInput {
  return suggestNextQuestionInputSchema.parse(value);
}

export function parseSuggestNextQuestionResult(value: unknown): SuggestNextQuestionResult {
  return suggestNextQuestionResultSchema.parse(value);
}

export function parseReviewCaseInput(value: unknown): ReviewCaseInput {
  return reviewCaseInputSchema.parse(value);
}

export function parseReviewCaseResult(value: unknown): ReviewCaseResult {
  return reviewCaseResultSchema.parse(value);
}

export function parseGenerateBriefInput(value: unknown): GenerateBriefInput {
  return generateBriefInputSchema.parse(value);
}

export function parseGenerateBriefResult(value: unknown): GenerateBriefResult {
  return generateBriefResultSchema.parse(value);
}

import type { CaseStatus } from "./CaseStatus";

export type DecisionCaseStatus = CaseStatus;

export type DecisionCase = {
  id: string;
  title: string;
  initialNarrative: string;
  status: DecisionCaseStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type CreateDecisionCaseInput = {
  title: string;
  initialNarrative: string;
};

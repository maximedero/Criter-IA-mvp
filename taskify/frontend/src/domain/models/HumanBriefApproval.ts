export const HUMAN_BRIEF_APPROVAL_STATUSES = ["NOT_APPROVED", "APPROVED"] as const;
export type HumanBriefApprovalStatus = (typeof HUMAN_BRIEF_APPROVAL_STATUSES)[number];

export type ApprovalCheck = {
  id: string;
  label: string;
  passed: boolean;
  reason: string;
};

export type ApprovalBlocker = {
  id: string;
  reason: string;
};

export type ApprovalChecklistSnapshot = {
  ready: boolean;
  checks: ApprovalCheck[];
  blockers: ApprovalBlocker[];
  evaluatedAt: string;
};

export type ApprovalReadiness = {
  ready: boolean;
  checks: ApprovalCheck[];
  blockers: ApprovalBlocker[];
};

export type HumanBriefApproval = {
  caseId: string;
  briefId: string;
  briefVersion: number;
  status: HumanBriefApprovalStatus;
  approvedBy: "USER";
  approvedAt: string | null;
  confirmedBriefVersion: number | null;
  checklistSnapshot: ApprovalChecklistSnapshot;
  createdAt: string;
  updatedAt: string;
};

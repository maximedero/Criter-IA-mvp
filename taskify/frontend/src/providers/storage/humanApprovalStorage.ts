import type { HumanBriefApproval } from "../../domain/models/HumanBriefApproval";

const STORAGE_KEY = "dw.humanBriefApprovals";

type ApprovalMap = Record<string, HumanBriefApproval>;

function parse(raw: string | null): ApprovalMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as ApprovalMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function loadMap(): ApprovalMap {
  return parse(localStorage.getItem(STORAGE_KEY));
}

function writeMap(value: ApprovalMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function getHumanBriefApproval(caseId: string): HumanBriefApproval | null {
  const map = loadMap();
  return map[caseId] ?? null;
}

export function saveHumanBriefApproval(approval: HumanBriefApproval): HumanBriefApproval {
  const map = loadMap();
  map[approval.caseId] = approval;
  writeMap(map);
  return approval;
}

export function removeHumanBriefApproval(caseId: string): void {
  const map = loadMap();
  delete map[caseId];
  writeMap(map);
}

export function clearHumanBriefApprovalsForTests(): void {
  localStorage.removeItem(STORAGE_KEY);
}

import type { BriefRecord, DecisionBrief } from "../../domain/models/DecisionBrief";

const STORAGE_KEY = "dw.briefs";

type BriefMap = Record<string, BriefRecord>;

function parse(raw: string | null): BriefMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as BriefMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function loadMap(): BriefMap {
  return parse(localStorage.getItem(STORAGE_KEY));
}

function writeMap(value: BriefMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function emptyRecord(): BriefRecord {
  return {
    current: null,
    history: [],
    stale: false
  };
}

export function getBriefRecord(caseId: string): BriefRecord {
  const map = loadMap();
  return map[caseId] ?? emptyRecord();
}

export function saveCurrentBrief(caseId: string, brief: DecisionBrief): BriefRecord {
  const map = loadMap();
  const record = map[caseId] ?? emptyRecord();

  map[caseId] = {
    current: brief,
    history: record.history,
    stale: false
  };

  writeMap(map);
  return map[caseId];
}

export function saveRegeneratedBrief(caseId: string, brief: DecisionBrief): BriefRecord {
  const map = loadMap();
  const record = map[caseId] ?? emptyRecord();

  const history = record.current ? [...record.history, record.current] : record.history;

  map[caseId] = {
    current: brief,
    history,
    stale: false
  };

  writeMap(map);
  return map[caseId];
}

export function setBriefStale(caseId: string, stale: boolean): BriefRecord {
  const map = loadMap();
  const record = map[caseId] ?? emptyRecord();
  map[caseId] = {
    ...record,
    stale
  };
  writeMap(map);
  return map[caseId];
}

export function clearBriefsForTests(): void {
  localStorage.removeItem(STORAGE_KEY);
}

import type { BriefRecord, DecisionBrief } from "../../domain/models/DecisionBrief";

const STORAGE_KEY = "dw.briefs";

type BriefMap = Record<string, BriefRecord>;

function nowIso(): string {
  return new Date().toISOString();
}

function recordNeedsCommunicationMigration(record: BriefRecord): boolean {
  const currentNeeds = Boolean(record.current && !(record.current as DecisionBrief & { communication?: unknown }).communication);
  const historyNeeds = record.history.some(
    (item) => !(item as DecisionBrief & { communication?: unknown }).communication
  );

  return currentNeeds || historyNeeds;
}

function withCommunication(brief: DecisionBrief): DecisionBrief {
  const timestamp = brief.updatedAt || nowIso();

  return {
    ...brief,
    communication: brief.communication ?? {
      email: {
        subject: "",
        body: "",
        editedByUser: false,
        updatedAt: timestamp
      },
      message: {
        body: "",
        editedByUser: false,
        updatedAt: timestamp
      }
    }
  };
}

function normalizeRecord(record: BriefRecord): BriefRecord {
  return {
    ...record,
    current: record.current ? withCommunication(record.current) : null,
    history: record.history.map(withCommunication)
  };
}

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
  const record = map[caseId] ?? emptyRecord();
  const normalized = normalizeRecord(record);

  if (recordNeedsCommunicationMigration(record)) {
    map[caseId] = normalized;
    writeMap(map);
  }

  return normalized;
}

export function saveCurrentBrief(caseId: string, brief: DecisionBrief): BriefRecord {
  const map = loadMap();
  const record = map[caseId] ?? emptyRecord();
  const normalizedBrief = withCommunication(brief);

  map[caseId] = {
    current: normalizedBrief,
    history: record.history.map(withCommunication),
    stale: false
  };

  writeMap(map);
  return map[caseId];
}

export function saveRegeneratedBrief(caseId: string, brief: DecisionBrief): BriefRecord {
  const map = loadMap();
  const record = map[caseId] ?? emptyRecord();
  const normalizedBrief = withCommunication(brief);

  const history = record.current
    ? [...record.history.map(withCommunication), withCommunication(record.current)]
    : record.history.map(withCommunication);

  map[caseId] = {
    current: normalizedBrief,
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

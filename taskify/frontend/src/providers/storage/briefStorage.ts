import type { BriefRecord, DecisionBrief } from "../../domain/models/DecisionBrief";

const STORAGE_KEY = "dw.briefs";

type BriefMap = Record<string, BriefRecord>;

type LegacyBriefRecord = Partial<BriefRecord> & {
  current?: DecisionBrief | null;
  history?: DecisionBrief[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function recordNeedsCommunicationMigration(record: LegacyBriefRecord): boolean {
  const currentNeeds = Boolean(record.current && !(record.current as DecisionBrief & { communication?: unknown }).communication);
  const historyNeeds = (record.history ?? []).some(
    (item) => !(item as DecisionBrief & { communication?: unknown }).communication
  );
  const staleNeeds = typeof record.stale !== "boolean";
  const historyArrayNeeds = !Array.isArray(record.history);

  return currentNeeds || historyNeeds || staleNeeds || historyArrayNeeds;
}

function withCommunication(brief: DecisionBrief): DecisionBrief {
  const timestamp = brief.updatedAt || brief.createdAt || nowIso();

  return {
    ...brief,
    version: Number.isInteger(brief.version) && brief.version > 0 ? brief.version : 1,
    status: brief.status ?? "GENERATED",
    reviewedByUser: Boolean(brief.reviewedByUser),
    reviewedAt: brief.reviewedByUser ? brief.reviewedAt ?? null : null,
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

function normalizeRecord(record: LegacyBriefRecord): BriefRecord {
  return {
    current: record.current ? withCommunication(record.current) : null,
    history: (record.history ?? []).map(withCommunication),
    stale: typeof record.stale === "boolean" ? record.stale : false
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
  const record = (map[caseId] as LegacyBriefRecord | undefined) ?? emptyRecord();
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

import type { CaseStatus } from "../../domain/models/CaseStatus";
import type { CreateDecisionCaseInput, DecisionCase } from "../../domain/models/DecisionCase";
import { purgeExpiredDecisionCases, RETENTION_MS } from "../../domain/rules/retentionRules";

const STORAGE_KEY = "dw.cases";

function parseCases(raw: string | null): DecisionCase[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as DecisionCase[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCases(items: DecisionCase[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadCases(): DecisionCase[] {
  const parsed = parseCases(localStorage.getItem(STORAGE_KEY));
  const purged = purgeExpiredDecisionCases(parsed);

  if (purged.length !== parsed.length) {
    writeCases(purged);
  }

  return purged;
}

function assertValidInput(input: CreateDecisionCaseInput): { title: string; initialNarrative: string } {
  const title = input.title.trim();
  const initialNarrative = input.initialNarrative.trim();

  if (!title) {
    throw new Error("title is required");
  }

  if (!initialNarrative) {
    throw new Error("initialNarrative is required");
  }

  return { title, initialNarrative };
}

function nextId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `case-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

export function listDecisionCases(): DecisionCase[] {
  return loadCases().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getDecisionCaseById(id: string): DecisionCase | null {
  const items = loadCases();
  return items.find((item) => item.id === id) ?? null;
}

export function createDecisionCase(input: CreateDecisionCaseInput): DecisionCase {
  const safe = assertValidInput(input);
  const now = new Date();

  const item: DecisionCase = {
    id: nextId(),
    title: safe.title,
    initialNarrative: safe.initialNarrative,
    status: "DRAFT",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + RETENTION_MS).toISOString()
  };

  const items = loadCases();
  writeCases([item, ...items]);

  return item;
}

export function updateDecisionCaseStatus(id: string, status: CaseStatus): DecisionCase {
  const items = loadCases();
  const index = items.findIndex((item) => item.id === id);

  if (index < 0) {
    throw new Error("case not found");
  }

  const current = items[index];
  const updated: DecisionCase = {
    ...current,
    status,
    updatedAt: new Date().toISOString()
  };

  const nextItems = [...items];
  nextItems[index] = updated;
  writeCases(nextItems);

  return updated;
}

export function clearDecisionCasesForTests(): void {
  localStorage.removeItem(STORAGE_KEY);
}

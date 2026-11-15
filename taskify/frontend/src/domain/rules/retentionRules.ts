import type { DecisionCase } from "../models/DecisionCase";

export const RETENTION_DAYS = 90;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function isExpiredDecisionCase(item: DecisionCase, nowMs: number = Date.now()): boolean {
  return new Date(item.expiresAt).getTime() <= nowMs;
}

export function purgeExpiredDecisionCases(items: DecisionCase[], nowMs: number = Date.now()): DecisionCase[] {
  return items.filter((item) => !isExpiredDecisionCase(item, nowMs));
}

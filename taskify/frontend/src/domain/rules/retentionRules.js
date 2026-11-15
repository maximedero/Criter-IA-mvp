export const RETENTION_DAYS = 90;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;
export function isExpiredDecisionCase(item, nowMs = Date.now()) {
    return new Date(item.expiresAt).getTime() <= nowMs;
}
export function purgeExpiredDecisionCases(items, nowMs = Date.now()) {
    return items.filter((item) => !isExpiredDecisionCase(item, nowMs));
}

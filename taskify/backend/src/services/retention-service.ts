import { writeAuditEvent } from "./audit-service.js";
import type { DecisionCase } from "../domain/types.js";

const RETENTION_DAYS = 90;

export function purgeExpiredCases(cases: DecisionCase[]): DecisionCase[] {
  const now = Date.now();
  const retained = cases.filter((c) => {
    const ageMs = now - new Date(c.createdAt).getTime();
    return ageMs <= RETENTION_DAYS * 24 * 60 * 60 * 1000;
  });

  if (retained.length !== cases.length) {
    writeAuditEvent({ eventType: "retention_purge", actorType: "sistema", payload: { deleted: cases.length - retained.length } });
  }

  return retained;
}

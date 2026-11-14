type AuditEvent = {
  eventType: string;
  caseId?: string;
  actorType: "humano" | "sistema" | "ia";
  payload?: Record<string, unknown>;
  createdAt: string;
};

const auditEvents: AuditEvent[] = [];

export function writeAuditEvent(event: Omit<AuditEvent, "createdAt">): void {
  auditEvents.push({ ...event, createdAt: new Date().toISOString() });
}

export function getAuditEvents(): AuditEvent[] {
  return auditEvents;
}

import type {
  AiQuestionSession,
  PersistedQuestion,
  QuestionStatus,
  SuggestNextQuestionResult
} from "../../domain/models/ContextualQuestion";

const STORAGE_KEY = "dw.aiSessions";

type SessionMap = Record<string, AiQuestionSession>;

function parse(raw: string | null): SessionMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as SessionMap;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function loadMap(): SessionMap {
  return parse(localStorage.getItem(STORAGE_KEY));
}

function writeMap(value: SessionMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function nowIso(): string {
  return new Date().toISOString();
}

function emptySession(caseId: string): AiQuestionSession {
  return {
    caseId,
    questionCount: 0,
    questions: [],
    lastStop: null,
    userStopped: false,
    updatedAt: nowIso()
  };
}

export function getAiQuestionSession(caseId: string): AiQuestionSession {
  const map = loadMap();
  return map[caseId] ?? emptySession(caseId);
}

export function saveAiQuestionSession(session: AiQuestionSession): void {
  const map = loadMap();
  map[session.caseId] = {
    ...session,
    updatedAt: nowIso()
  };
  writeMap(map);
}

export function setActiveQuestion(caseId: string, question: PersistedQuestion): void {
  const session = getAiQuestionSession(caseId);
  const active = session.questions.find((item) => item.status === "ACTIVE");

  if (active) {
    return;
  }

  const updated: AiQuestionSession = {
    ...session,
    questionCount: session.questionCount + 1,
    questions: [...session.questions, question],
    lastStop: null
  };

  saveAiQuestionSession(updated);
}

export function findActiveQuestion(caseId: string): PersistedQuestion | null {
  const session = getAiQuestionSession(caseId);
  return session.questions.find((item) => item.status === "ACTIVE") ?? null;
}

export function updateQuestionStatus(
  caseId: string,
  questionId: string,
  status: QuestionStatus,
  resultingCanvasItemId?: string
): PersistedQuestion {
  const session = getAiQuestionSession(caseId);
  const index = session.questions.findIndex((item) => item.id === questionId);

  if (index < 0) {
    throw new Error("question not found");
  }

  const current = session.questions[index];
  const updated: PersistedQuestion = {
    ...current,
    status,
    updatedAt: nowIso(),
    answeredAt: status === "ACTIVE" ? current.answeredAt : nowIso(),
    resultingCanvasItemId: resultingCanvasItemId ?? current.resultingCanvasItemId
  };

  const nextQuestions = [...session.questions];
  nextQuestions[index] = updated;
  saveAiQuestionSession({
    ...session,
    questions: nextQuestions
  });

  return updated;
}

export function setStopResult(caseId: string, stop: SuggestNextQuestionResult): void {
  const session = getAiQuestionSession(caseId);
  saveAiQuestionSession({
    ...session,
    lastStop: stop
  });
}

export function markUserStopped(caseId: string): void {
  const session = getAiQuestionSession(caseId);
  saveAiQuestionSession({
    ...session,
    userStopped: true,
    lastStop: {
      question: null,
      shouldStop: true,
      stopReason: "USER_STOPPED",
      remainingMissingDimensions: [],
      provisionalBriefAllowed: false,
      message: "Asistencia contextual detenida por el usuario."
    }
  });
}

export function clearAiQuestionSessionsForTests(): void {
  localStorage.removeItem(STORAGE_KEY);
}

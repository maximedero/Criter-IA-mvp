import { useMemo, useState } from "react";
import { CANVAS_DIMENSION_LABELS, type CanvasItem, type EpistemicType } from "../../domain/models/CanvasItem";
import { evaluateMinimumCoverage } from "../../domain/rules/coverageRules";
import {
  createPersistedQuestion,
  canRequestNextQuestion,
  missingCoverage
} from "../../domain/workflow/questionLoop";
import {
  answerActiveQuestion,
  declareNoRelevantUncertainty,
  supersedeActiveQuestionIfCovered
} from "../../domain/workflow/questionResponses";
import {
  findActiveQuestion,
  getAiQuestionSession,
  setActiveQuestion,
  setStopResult
} from "../../providers/storage/aiSessionStorage";
import { parseSuggestNextQuestionResult, type AIProvider } from "../../providers/ai";
import { QuestionResponseActions } from "./QuestionResponseActions";
import type { CaseStatus } from "../../domain/models/CaseStatus";

type Props = {
  caseId: string;
  initialNarrative: string;
  caseStatus: CaseStatus;
  items: CanvasItem[];
  provider: AIProvider;
  onItemsUpdated: () => void;
};

function statusAllowsQuestion(status: CaseStatus): boolean {
  return status === "DRAFT" || status === "IN_ANALYSIS";
}

function toCoveredCanvasDimensions(items: CanvasItem[]): CanvasItem["dimension"][] {
  return items
    .filter((item) => item.validationStatus === "VALIDATED" || item.validationStatus === "EDITED")
    .map((item) => item.dimension);
}

export function QuestionPanel({ caseId, initialNarrative, caseStatus, items, provider, onItemsUpdated }: Props) {
  const [requesting, setRequesting] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const coverage = useMemo(() => evaluateMinimumCoverage(items), [items]);
  const session = getAiQuestionSession(caseId);
  const activeQuestion = findActiveQuestion(caseId);
  const selectedEpistemicType: EpistemicType = activeQuestion?.suggestedEpistemicType ?? "INFERENCE";

  if (!statusAllowsQuestion(caseStatus)) {
    return null;
  }

  return (
    <section aria-label="Asistencia contextual">
      <h4>ASISTENCIA CONTEXTUAL</h4>

      <button
        type="button"
        onClick={async () => {
          setError(null);
          setLocalMessage(null);

          if (!canRequestNextQuestion(activeQuestion)) {
            setLocalMessage("Ya existe una pregunta activa.");
            return;
          }

          setRequesting(true);

          try {
            const raw = await provider.suggestNextQuestion({
              caseId,
              initialNarrative,
              currentItems: items,
              coverageResult: coverage,
              previousQuestions: session.questions,
              questionCount: session.questionCount,
              currentCaseStatus: caseStatus
            });

            const result = parseSuggestNextQuestionResult(raw);

            if (result.shouldStop) {
              setStopResult(caseId, result);
              setLocalMessage(result.message);
              return;
            }

            const persisted = createPersistedQuestion(caseId, result.question!);
            setActiveQuestion(caseId, persisted);
            setAnswerText("");
            setLocalMessage("Pregunta activa cargada.");
            onItemsUpdated();
          } catch {
            setError("No se pudo obtener la siguiente pregunta.");
          } finally {
            setRequesting(false);
          }
        }}
        disabled={requesting}
      >
        Obtener siguiente pregunta
      </button>

      {session.lastStop?.message ? <p>{session.lastStop.message}</p> : null}
      {localMessage ? <p>{localMessage}</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      {activeQuestion ? (
        <section>
          <h5>Pregunta activa</h5>
          <p>
            <strong>Dimensión:</strong> {CANVAS_DIMENSION_LABELS[activeQuestion.targetDimension]}
          </p>
          <p>
            <strong>Pregunta:</strong> {activeQuestion.question}
          </p>
          <p>
            <strong>Por qué importa:</strong> {activeQuestion.reason}
          </p>

          <QuestionResponseActions
            question={activeQuestion}
            answering={answering}
            error={error}
            answerText={answerText}
            selectedEpistemicType={selectedEpistemicType}
            onAnswerTextChange={setAnswerText}
            onEpistemicTypeChange={() => {
              // optional override left for future
            }}
            onDeclareNoUncertainty={() => {
              setError(null);
              const created = declareNoRelevantUncertainty(caseId);
              supersedeActiveQuestionIfCovered(caseId, [created.dimension]);
              setLocalMessage("Se registró la ausencia de incertidumbres relevantes.");
              onItemsUpdated();
            }}
            onAction={(action) => {
              setError(null);
              setAnswering(true);

              try {
                const result = answerActiveQuestion(caseId, {
                  action,
                  answerText,
                  selectedEpistemicType
                });

                if (result.createdItem) {
                  supersedeActiveQuestionIfCovered(caseId, [result.createdItem.dimension]);
                }

                setAnswerText("");
                setLocalMessage("Respuesta registrada.");
                onItemsUpdated();
              } catch (err) {
                setError(err instanceof Error ? err.message : "No se pudo registrar la respuesta.");
              } finally {
                setAnswering(false);
              }
            }}
          />
        </section>
      ) : null}

      {!activeQuestion && session.questions.length > 0 ? (
        <button
          type="button"
          onClick={async () => {
            setError(null);
            setLocalMessage(null);

            setRequesting(true);
            try {
              const raw = await provider.suggestNextQuestion({
                caseId,
                initialNarrative,
                currentItems: items,
                coverageResult: evaluateMinimumCoverage(items),
                previousQuestions: session.questions,
                questionCount: session.questionCount,
                currentCaseStatus: caseStatus
              });

              const result = parseSuggestNextQuestionResult(raw);

              if (result.shouldStop) {
                setStopResult(caseId, result);
                setLocalMessage(result.message);
              } else {
                const persisted = createPersistedQuestion(caseId, result.question!);
                setActiveQuestion(caseId, persisted);
                setLocalMessage("Pregunta activa cargada.");
                onItemsUpdated();
              }
            } catch {
              setError("No se pudo obtener la siguiente pregunta.");
            } finally {
              setRequesting(false);
            }
          }}
          disabled={requesting || coverage.hasMinimumCoverage}
        >
          Siguiente pregunta
        </button>
      ) : null}

      <p>
        Cobertura actual: {coverage.coveredCount} de {coverage.requiredCount}
      </p>
      <p>Dimensiones faltantes: {missingCoverage(coverage).join(", ") || "Ninguna"}</p>
    </section>
  );
}

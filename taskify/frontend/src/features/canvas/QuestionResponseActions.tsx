import type { EpistemicType } from "../../domain/models/CanvasItem";
import type { DynamicQuestion, QuestionAnswerOption } from "../../domain/models/ContextualQuestion";
import { EpistemicTypeSelector } from "./EpistemicTypeSelector";

type Props = {
  question: DynamicQuestion;
  answering: boolean;
  error: string | null;
  answerText: string;
  selectedEpistemicType: EpistemicType;
  onAnswerTextChange: (value: string) => void;
  onEpistemicTypeChange: (value: EpistemicType) => void;
  onAction: (action: QuestionAnswerOption) => void;
  onDeclareNoUncertainty: () => void;
};

export function QuestionResponseActions({
  question,
  answering,
  error,
  answerText,
  selectedEpistemicType,
  onAnswerTextChange,
  onEpistemicTypeChange,
  onAction,
  onDeclareNoUncertainty
}: Props) {
  return (
    <div>
      <label>
        Respuesta
        <textarea
          value={answerText}
          onChange={(event) => onAnswerTextChange(event.target.value)}
          disabled={answering}
        />
      </label>

      <EpistemicTypeSelector value={selectedEpistemicType} onChange={onEpistemicTypeChange} />

      {error ? <p role="alert">{error}</p> : null}

      <div>
        <button type="button" onClick={() => onAction("ANSWER")} disabled={answering}>
          Agregar respuesta al Canvas
        </button>
        {question.answerOptions.includes("DONT_KNOW") ? (
          <button type="button" onClick={() => onAction("DONT_KNOW")} disabled={answering}>
            No lo sé
          </button>
        ) : null}
        {question.answerOptions.includes("NOT_APPLICABLE") ? (
          <button type="button" onClick={() => onAction("NOT_APPLICABLE")} disabled={answering}>
            No aplica
          </button>
        ) : null}
        {question.answerOptions.includes("SKIP_FOR_NOW") ? (
          <button type="button" onClick={() => onAction("SKIP_FOR_NOW")} disabled={answering}>
            Omitir por ahora
          </button>
        ) : null}
      </div>

      {question.targetDimension === "UNCERTAINTY" ? (
        <button type="button" onClick={onDeclareNoUncertainty} disabled={answering}>
          No identifico incertidumbres relevantes.
        </button>
      ) : null}
    </div>
  );
}

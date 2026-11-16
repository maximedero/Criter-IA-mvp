import type { EpistemicType } from "../../domain/models/CanvasItem";
import type { DynamicQuestion, QuestionAnswerOption } from "../../domain/models/ContextualQuestion";
import { Button } from "../../app/ui/Button";
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
    <div className="dw-question-actions">
      <label>
        Respuesta
        <textarea
          value={answerText}
          onChange={(event) => onAnswerTextChange(event.target.value)}
          disabled={answering}
        />
      </label>

      <EpistemicTypeSelector value={selectedEpistemicType} onChange={onEpistemicTypeChange} />

      {error ? (
        <p className="dw-canvas-alert" role="alert">
          {error}
        </p>
      ) : null}

      <div className="dw-question-actions__buttons">
        <Button type="button" onClick={() => onAction("ANSWER")} disabled={answering}>
          Agregar respuesta al Canvas
        </Button>
        {question.answerOptions.includes("DONT_KNOW") ? (
          <Button type="button" variant="ghost" onClick={() => onAction("DONT_KNOW")} disabled={answering}>
            No lo sé
          </Button>
        ) : null}
        {question.answerOptions.includes("NOT_APPLICABLE") ? (
          <Button type="button" variant="ghost" onClick={() => onAction("NOT_APPLICABLE")} disabled={answering}>
            No aplica
          </Button>
        ) : null}
        {question.answerOptions.includes("SKIP_FOR_NOW") ? (
          <Button type="button" variant="ghost" onClick={() => onAction("SKIP_FOR_NOW")} disabled={answering}>
            Omitir por ahora
          </Button>
        ) : null}
      </div>

      {question.targetDimension === "UNCERTAINTY" ? (
        <Button type="button" variant="ghost" onClick={onDeclareNoUncertainty} disabled={answering}>
          No identifico incertidumbres relevantes.
        </Button>
      ) : null}
    </div>
  );
}

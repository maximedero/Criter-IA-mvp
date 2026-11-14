import { useState } from "react";
import { getNextQuestion } from "../../services/api-client";

type Props = {
  caseId: string;
};

export function QuestionPanel({ caseId }: Props) {
  const [question, setQuestion] = useState<string>("");
  const [count, setCount] = useState(0);
  const [suggestion, setSuggestion] = useState<string>("");

  const askNext = async () => {
    const response = await getNextQuestion(caseId);
    setCount(response.questionCount);
    setQuestion(response.question ?? "");
    setSuggestion(response.suggestion ?? "");
  };

  return (
    <aside>
      <h2>Preguntas dinámicas</h2>
      <button onClick={askNext}>Siguiente pregunta</button>
      <p>Preguntas realizadas: {count}/5</p>
      {question ? <p>{question}</p> : null}
      {suggestion ? <p>{suggestion}</p> : null}
    </aside>
  );
}

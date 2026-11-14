import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { getNextQuestion } from "../../services/api-client";
export function QuestionPanel({ caseId }) {
    const [question, setQuestion] = useState("");
    const [count, setCount] = useState(0);
    const [suggestion, setSuggestion] = useState("");
    const askNext = async () => {
        const response = await getNextQuestion(caseId);
        setCount(response.questionCount);
        setQuestion(response.question ?? "");
        setSuggestion(response.suggestion ?? "");
    };
    return (_jsxs("aside", { children: [_jsx("h2", { children: "Preguntas din\u00E1micas" }), _jsx("button", { onClick: askNext, children: "Siguiente pregunta" }), _jsxs("p", { children: ["Preguntas realizadas: ", count, "/5"] }), question ? _jsx("p", { children: question }) : null, suggestion ? _jsx("p", { children: suggestion }) : null] }));
}

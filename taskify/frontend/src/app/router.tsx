import { useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { InboxPage } from "../features/inbox/inbox-page";
import { CanvasPage } from "../features/canvas/canvas-page";

function AppRoutes() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");

  return (
    <>
      <nav>
        <Link to="/">Inbox</Link>
        {selectedCaseId ? <Link to="/canvas">Canvas</Link> : null}
      </nav>
      <Routes>
        <Route path="/" element={<InboxPage onOpenCase={(id) => setSelectedCaseId(id)} />} />
        <Route path="/canvas" element={selectedCaseId ? <CanvasPage caseId={selectedCaseId} /> : <p>Seleccione un caso</p>} />
      </Routes>
    </>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

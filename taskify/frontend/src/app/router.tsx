import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { InboxPage } from "../features/inbox/inbox-page";

function AppRoutes() {
  return (
    <>
      <nav>
        <Link to="/">Inbox</Link>
      </nav>
      <Routes>
        <Route path="/" element={<InboxPage />} />
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

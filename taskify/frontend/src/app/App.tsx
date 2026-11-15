import type { AIProvider } from "../providers/ai";
import { InboxPage } from "../features/inbox/inbox-page";

type Props = {
  aiProvider?: AIProvider;
};

export function App({ aiProvider }: Props) {
  return (
    <main>
      <h1>Decision Workspace</h1>
      <InboxPage aiProvider={aiProvider} />
    </main>
  );
}

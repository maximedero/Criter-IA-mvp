import { Statement } from "../../services/api-client";

type Props = {
  statement?: Statement;
};

export function StatementCard({ statement }: Props) {
  if (!statement) {
    return <div>Sin contenido</div>;
  }

  return (
    <article>
      <p>{statement.content}</p>
      <small>{statement.epistemicType}</small>
      <small>{statement.validationState}</small>
    </article>
  );
}

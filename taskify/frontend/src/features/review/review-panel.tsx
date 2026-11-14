type Finding = {
  level: string;
  message: string;
};

type Props = {
  findings: Finding[];
};

export function ReviewPanel({ findings }: Props) {
  return (
    <section>
      <h2>Revisión crítica</h2>
      <ul>
        {findings.map((f, idx) => (
          <li key={idx}>{f.level}: {f.message}</li>
        ))}
      </ul>
    </section>
  );
}

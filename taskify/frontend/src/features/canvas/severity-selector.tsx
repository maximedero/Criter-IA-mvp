type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SeveritySelector({ value, onChange }: Props) {
  return (
    <label>
      Evaluación realizada por la persona usuaria
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="sin_evaluar">Sin evaluar</option>
        <option value="baja">Baja</option>
        <option value="media">Media</option>
        <option value="alta">Alta</option>
        <option value="critica">Crítica</option>
      </select>
    </label>
  );
}

import { EPISTEMIC_TYPE_LABELS, EPISTEMIC_TYPES, type EpistemicType } from "../../domain/models/CanvasItem";

type Props = {
  value: EpistemicType;
  onChange: (next: EpistemicType) => void;
};

export function EpistemicTypeSelector({ value, onChange }: Props) {
  return (
    <label>
      Tipo epistemológico
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as EpistemicType)}
      >
        {EPISTEMIC_TYPES.map((item) => (
          <option key={item} value={item}>
            {EPISTEMIC_TYPE_LABELS[item]}
          </option>
        ))}
      </select>
    </label>
  );
}

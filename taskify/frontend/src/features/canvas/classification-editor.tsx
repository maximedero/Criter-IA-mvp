type Props = {
  epistemicType: string;
  sourceType: string;
  onChange: (value: { epistemicType: string; sourceType: string }) => void;
};

export function ClassificationEditor({ epistemicType, sourceType, onChange }: Props) {
  return (
    <div>
      <label>
        Tipo epistemológico
        <select value={epistemicType} onChange={(e) => onChange({ epistemicType: e.target.value, sourceType })}>
          <option value="hecho">Hecho</option>
          <option value="inferencia">Inferencia</option>
          <option value="supuesto">Supuesto</option>
          <option value="dato_faltante">Dato faltante</option>
          <option value="evaluacion_humana">Evaluación humana</option>
        </select>
      </label>
      <label>
        Fuente
        <select value={sourceType} onChange={(e) => onChange({ epistemicType, sourceType: e.target.value })}>
          <option value="documental">Documental</option>
          <option value="confirmado_por_persona">Confirmado por persona</option>
          <option value="sin_fuente">Sin fuente</option>
        </select>
      </label>
    </div>
  );
}

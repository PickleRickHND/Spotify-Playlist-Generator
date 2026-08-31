import "./Slider.css";

export default function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit,
  formatValue,
}) {
  const display = formatValue
    ? formatValue(value)
    : unit
    ? `${value}${unit}`
    : value;

  return (
    <div className="Slider">
      <div className="Slider-header">
        <span className="FieldLabel">{label}</span>
        <span className="Slider-value">{display}</span>
      </div>
      <input
        type="range"
        className="Slider-input"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

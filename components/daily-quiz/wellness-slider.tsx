"use client";

import { Label } from "@/components/ui/label";

type WellnessSliderProps = {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  onChange: (value: number) => void;
};

export function WellnessSlider({
  id,
  label,
  value,
  min = 1,
  max = 5,
  step = 1,
  unit,
  formatValue,
  disabled = false,
  onChange,
}: WellnessSliderProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit ?? ""}`;

  return (
    <div className={disabled ? "space-y-2 opacity-90" : "space-y-2"}>
      <div className="flex items-center justify-between text-sm">
        <Label htmlFor={id} className={disabled ? "text-muted-foreground" : undefined}>
          {label}
        </Label>
        <span className={disabled ? "text-muted-foreground/80" : "text-muted-foreground"}>
          {displayValue}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className={
          disabled
            ? "w-full cursor-not-allowed accent-muted-foreground opacity-50 grayscale"
            : "w-full accent-primary"
        }
      />
    </div>
  );
}

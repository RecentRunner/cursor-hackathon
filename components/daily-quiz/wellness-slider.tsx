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
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-muted-foreground">{displayValue}</span>
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
        className="w-full accent-primary disabled:opacity-60"
      />
    </div>
  );
}

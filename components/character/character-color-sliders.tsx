"use client";

import { Label } from "@/components/ui/label";
import {
  LIGHTNESS_MIN,
  clampHsl,
  displayToLightness,
  lightnessToDisplay,
  type HSL,
} from "@/lib/character/color-utils";
import { cn } from "@/lib/utils";

type ColorSliderProps = {
  label: string;
  value: number;
  displayValue?: number;
  min: number;
  max: number;
  gradient?: string;
  onChange: (value: number) => void;
};

export function ColorSlider({
  label,
  value,
  displayValue,
  min,
  max,
  gradient,
  onChange,
}: ColorSliderProps) {
  const shownValue = displayValue ?? value;

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {shownValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn(
          "h-2.5 w-full cursor-pointer appearance-none rounded-full border border-border/40",
          "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow-sm",
          "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:shadow-sm",
        )}
        style={
          gradient
            ? {
                background: gradient,
              }
            : undefined
        }
      />
    </div>
  );
}

type CharacterColorSlidersProps = {
  color: HSL;
  onChange: (color: HSL) => void;
};

export function CharacterColorSliders({
  color,
  onChange,
}: CharacterColorSlidersProps) {
  const hueGradient =
    "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

  const saturationGradient = `linear-gradient(to right, hsl(${color.h}, 0%, ${color.l}%), hsl(${color.h}, 100%, ${color.l}%))`;

  const lightnessGradient = `linear-gradient(to right, hsl(${color.h}, ${color.s}%, ${LIGHTNESS_MIN}%), hsl(${color.h}, ${color.s}%, 50%), hsl(${color.h}, ${color.s}%, 100%))`;

  const brightnessDisplay = lightnessToDisplay(color.l);

  return (
    <div className="grid gap-5">
      <ColorSlider
        label="Hue"
        value={color.h}
        min={0}
        max={360}
        gradient={hueGradient}
        onChange={(h) => onChange({ ...color, h })}
      />
      <ColorSlider
        label="Saturation"
        value={color.s}
        min={0}
        max={100}
        gradient={saturationGradient}
        onChange={(s) => onChange({ ...color, s })}
      />
      <ColorSlider
        label="Brightness"
        value={brightnessDisplay}
        displayValue={brightnessDisplay}
        min={0}
        max={100}
        gradient={lightnessGradient}
        onChange={(display) =>
          onChange(clampHsl({ ...color, l: displayToLightness(display) }))
        }
      />
    </div>
  );
}

import { cn } from "@/lib/utils";

type AvatarMood = "happy" | "neutral" | "tired";

const moodStyles: Record<AvatarMood, string> = {
  happy: "bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]",
  neutral: "bg-amber-300 shadow-[0_0_0_4px_rgba(251,191,36,0.25)]",
  tired: "bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.25)]",
};

type PixelAvatarProps = {
  mood?: AvatarMood;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeStyles = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function PixelAvatar({
  mood = "neutral",
  size = "lg",
  className,
}: PixelAvatarProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      aria-label={`Pixel pet avatar, mood ${mood}`}
    >
      <div
        className={cn(
          "relative rounded-md border-2 border-foreground/80",
          sizeStyles[size],
          moodStyles[mood],
        )}
        style={{ imageRendering: "pixelated" }}
      >
        <div className="absolute left-1/2 top-[28%] flex -translate-x-1/2 gap-2">
          <span className="h-2 w-2 rounded-[1px] bg-foreground/90" />
          <span className="h-2 w-2 rounded-[1px] bg-foreground/90" />
        </div>
        <div className="absolute bottom-[24%] left-1/2 h-1 w-4 -translate-x-1/2 rounded-[1px] bg-foreground/80" />
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {mood}
      </p>
    </div>
  );
}

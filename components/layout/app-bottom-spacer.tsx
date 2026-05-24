export function AppBottomSpacer() {
  return (
    <div
      aria-hidden
      className="app-bottom-spacer w-full shrink-0"
      style={{
        minHeight:
          "calc(var(--app-nav-offset, var(--bottom-nav-height)) + var(--app-viewport-bottom-offset, 0px))",
      }}
    />
  );
}

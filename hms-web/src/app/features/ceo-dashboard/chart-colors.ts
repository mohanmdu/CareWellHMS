/**
 * Chart.js paints to <canvas> and can't live-resolve CSS custom properties,
 * so each quadrant reads these once at chart-construction time rather than
 * referencing the --hms-chart-series-* var() strings directly.
 */
export function chartSeriesColors(): string[] {
  const root = getComputedStyle(document.documentElement);
  return [1, 2, 3, 4, 5].map((n) => root.getPropertyValue(`--hms-chart-series-${n}`).trim());
}

export function chartTextColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--hms-color-text').trim();
}

export function chartMutedColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--hms-color-text-muted').trim();
}

export function chartBorderColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--hms-color-border').trim();
}

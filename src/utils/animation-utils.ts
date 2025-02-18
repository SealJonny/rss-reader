export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function interpolateColor(
  startColor: RGB,
  endColor: RGB,
  steps: number,
  step: number
): RGB {
  const r = Math.round(
    startColor.r + ((endColor.r - startColor.r) / steps) * step
  );
  const g = Math.round(
    startColor.g + ((endColor.g - startColor.g) / steps) * step
  );
  const b = Math.round(
    startColor.b + ((endColor.b - startColor.b) / steps) * step
  );
  return { r, g, b };
}

export function colorText(text: string, color: RGB): string {
  return `\x1b[38;2;${color.r};${color.g};${color.b}m${text}\x1b[0m`;
}
  
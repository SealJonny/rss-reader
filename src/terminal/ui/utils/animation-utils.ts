/**
 * Animation- und Farbhilfsfunktionen für die UI
 */

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

/**
 * Erstellt einen Farbverlauf für einen Text
 * @param text Der zu färbende Text
 * @param startHex Die Startfarbe als Hex-String
 * @param endHex Die Endfarbe als Hex-String
 * @returns Den Text mit Farbverlauf
 */
export function createGradientText(text: string, startHex: string, endHex: string): string {
  const startColor = hexToRgb(startHex);
  const endColor = hexToRgb(endHex);
  const chars = text.split('');
  
  let result = '';
  for (let i = 0; i < chars.length; i++) {
    const color = interpolateColor(startColor, endColor, chars.length - 1, i);
    result += colorText(chars[i], color);
  }
  
  return result;
}
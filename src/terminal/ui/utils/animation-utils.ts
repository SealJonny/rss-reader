/**
 * Animation and color utility functions for UI components
 */

/**
 * Creates a promise that resolves after specified milliseconds
 *
 * @param ms Time to wait in milliseconds
 * @returns Promise that resolves after the specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Interface representing RGB color values
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Converts a hexadecimal color code to RGB object
 *
 * @param hex Hexadecimal color code (e.g., "#FF0000")
 * @returns RGB object with r, g, b components
 */
export function hexToRgb(hex: string): RGB {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Interpolates between two RGB colors
 *
 * @param startColor Starting RGB color
 * @param endColor Ending RGB color
 * @param steps Total number of steps in interpolation
 * @param step Current step in interpolation
 * @returns Interpolated RGB color
 */
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

/**
 * Applies a color to text using ANSI escape codes
 *
 * @param text Text to colorize
 * @param color RGB color to apply
 * @returns Colorized text with ANSI escape codes
 */
export function colorText(text: string, color: RGB): string {
  return `\x1b[38;2;${color.r};${color.g};${color.b}m${text}\x1b[0m`;
}

/**
 * Creates a gradient text effect across the provided string
 *
 * @param text Text to apply gradient to
 * @param startHex Starting hex color code
 * @param endHex Ending hex color code
 * @returns String with gradient coloring applied using ANSI escape codes
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
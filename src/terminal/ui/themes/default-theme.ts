// Theme file for consistent colors and styles

/**
 * Color palette used throughout the application
 */
export const colors = {
  primary: '#B2A4FF',
  secondary: '#FFB4B4',
  accent: '#D9ACDA',
  green: '#77DD77',
  red: '#FF6961',
  text: {
    normal: 'white',
    muted: 'gray',
    error: '#FF6961'
  },
  background: 'black',
}

/**
 * Reusable styles for UI elements
 */
export const styles = {
  // General styles for various UI elements
  box: {
    border: {
      fg: colors.secondary
    }
  },
  list: {
    selected: {
      fg: colors.primary
    },
    normal: {
      fg: colors.text.normal
    },
    heading: {
      fg: colors.accent
    }
  }
}

/**
 * Formats text as a heading with accent color and bold style
 * 
 * @param text Text to format as heading
 * @returns Blessed-compatible formatted string with tags
 */
export function formatHeading(text: string): string {
  return `{${colors.accent}-fg}{bold}${text}{/bold}{/${colors.accent}-fg}`;
}

/**
 * Formats text as selected with primary color
 * 
 * @param text Text to format as selected
 * @returns Blessed-compatible formatted string with tags
 */
export function formatSelected(text: string): string {
  return `{${colors.primary}-fg}${text}{/${colors.primary}-fg}`;
}
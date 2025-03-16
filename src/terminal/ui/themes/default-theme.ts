// Theme-Datei für konsistente Farben und Stile

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

export const styles = {
  // Allgemeine Stile für verschiedene UI-Elemente
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

// Format-Funktion zum Erstellen von Style-Tags für blessed
export function formatHeading(text: string): string {
  return `{${colors.accent}-fg}{bold}${text}{/bold}{/${colors.accent}-fg}`;
}

export function formatSelected(text: string): string {
  return `{${colors.primary}-fg}${text}{/${colors.primary}-fg}`;
}
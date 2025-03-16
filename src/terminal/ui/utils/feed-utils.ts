import blessed from 'blessed';

export function getScreenWidth(screen: blessed.Widgets.Screen): number {
  return screen.width as number;
}

export function getScreenHeight(screen: blessed.Widgets.Screen): number {
  return screen.height as number;
}

/**
 * Formatiert einen Text für die Terminalanzeige mit folgenden Funktionen:
 * - Wörter werden nicht am Zeilenende getrennt
 * - Jeder Text beginnt mit einem Prafix z.B. (📖 ) Standartwert: '  '
 * - Nach Zeilenumbrüchen wird der Text eingerückt, sodass er bündig beginnt
 *
 * @param prefix Das Präfix, das vor jeder Zeile hinzugefügt wird z.B. '📖 ' (Standart: '  ')
 * @param text Der zu formatierende Text (z.B. eine RSS-Beschreibung)
 * @param maxWidth Maximale Breite des Texts im Terminal (in Zeichen)
 * @returns Formatierter Text für die Terminalausgabe
 */
export function formatTerminalText(prefix:string = '  ',text: string, maxWidth: number): string {
  // Berechne die Einrückung basierend auf der Länge des Präfixes
  const indentation = ' '.repeat(prefix.length);

  // Entferne überschüssige Leerzeichen und normalisiere Zeilenumbrüche
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  // Die effektive Breite für den Text nach Abzug des Paddings und des Präfixes
  const effectiveWidth = maxWidth - 2 - prefix.length;

  if (effectiveWidth <= 0) {
    throw new Error('The maximum width is too small for formatting.');
  }

  const words = normalizedText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  // Verarbeite jedes Wort
  for (const word of words) {
    // Prüfe, ob das Wort in die aktuelle Zeile passt
    if (currentLine.length === 0) {
      // Erste Wort in einer neuen Zeile
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= effectiveWidth) {
      // Wort passt in die aktuelle Zeile
      currentLine += ' ' + word;
    } else {
      // Wort passt nicht in die aktuelle Zeile, füge aktuelle Zeile zu den Zeilen hinzu
      // und beginne eine neue Zeile mit dem Wort
      lines.push(currentLine);
      currentLine = word;
    }
  }

  // Letzte Zeile hinzufügen, falls vorhanden
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Formatiere die Zeilen mit Präfix und Einrückung
  const formattedText = lines.map((line, index) => {
    return index === 0 ? prefix + line : indentation + line;
  }).join('\n');

  return formattedText;
}
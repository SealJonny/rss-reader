import blessed from 'more-blessed';

/**
 * Gets the width of the terminal screen
 *
 * @param screen The blessed screen instance
 * @returns The width of the screen in characters
 */
export function getScreenWidth(screen: blessed.Widgets.Screen): number {
  return screen.width as number;
}

/**
 * Gets the height of the terminal screen
 *
 * @param screen The blessed screen instance
 * @returns The height of the screen in characters
 */
export function getScreenHeight(screen: blessed.Widgets.Screen): number {
  return screen.height as number;
}

/**
 * Counts the number of digits in a number
 *
 * @param num Number to count digits of
 * @returns Number of digits
 */
export function countDigits(num: number): number {
  return Math.abs(num)
    .toString()
    .replace('.', '')
    .length;
}

/**
 * Formats text for terminal display with the following features:
 * - Words are not split at the end of lines
 * - Each text starts with a prefix (e.g. "📖 "), default: '  '
 * - After line breaks, the text is indented so that it starts aligned
 *
 * @param prefix The prefix added before each line, e.g. '📖 ' (default: '  ')
 * @param text The text to format (e.g. an RSS description)
 * @param maxWidth Maximum width of text in the terminal (in characters)
 * @returns Formatted text for terminal output
 */
export function formatTerminalText(prefix:string = '  ',text: string, maxWidth: number): string {
  const indentation = ' '.repeat(prefix.length);

  const normalizedText = (text || "").replace(/\s+/g, ' ').trim();

  // The effective width for text after subtracting padding and prefix
  const effectiveWidth = maxWidth - 2 - prefix.length;

  if (effectiveWidth <= 0) {
    throw new Error('The maximum width is too small for formatting.');
  }

  const words = normalizedText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  // Process each word
  for (const word of words) {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= effectiveWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Format lines with prefix and indentation
  const formattedText = lines.map((line, index) => {
    return index === 0 ? prefix + line : indentation + line;
  }).join('\n');

  return formattedText;
}
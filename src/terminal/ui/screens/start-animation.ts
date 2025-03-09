import blessed from 'blessed';
import { wait, hexToRgb, interpolateColor, colorText } from '../utils/animation-utils';

// Frames für die Startanimation
const startAnimationFrames: string[][] = [
  [
    "██████╗ ",
    "██╔══██╗",
    "██████╔╝",
    "██╔══██╗",
    "██║  ██║",
    "╚═╝  ╚═╝",
  ],
  [
    "██████╗ ███████╗",
    "██╔══██╗██╔════╝",
    "██████╔╝███████╗",
    "██╔══██╗╚════██║",
    "██║  ██║███████║",
    "╚═╝  ╚═╝╚══════╝",
  ],
  [
    "██████╗ ███████╗███████╗",
    "██╔══██╗██╔════╝██╔════╝",
    "██████╔╝███████╗███████╗",
    "██╔══██╗╚════██║╚════██║",
    "██║  ██║███████║███████║",
    "╚═╝  ╚═╝╚══════╝╚══════╝",
  ],
  [
    "██████╗ ███████╗███████╗    ██████╗ ",
    "██╔══██╗██╔════╝██╔════╝    ██╔══██╗",
    "██████╔╝███████╗███████╗    ██████╔╝",
    "██╔══██╗╚════██║╚════██║    ██╔══██╗",
    "██║  ██║███████║███████║    ██║  ██║",
    "╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝",
  ],
  [
    "██████╗ ███████╗███████╗    ██████╗ ███████╗",
    "██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝",
    "██████╔╝███████╗███████╗    ██████╔╝█████╗  ",
    "██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ",
    "██║  ██║███████║███████║    ██║  ██║███████╗",
    "╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝",
  ],
  [
    "██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ",
    "██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗",
    "██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║",
    "██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║",
    "██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║",
    "╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝",
  ],
  [
    "██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ██████╗ ",
    "██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔══██╗",
    "██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║██║  ██║",
    "██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║██║  ██║",
    "██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║██████╔╝",
    "╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ",
  ],
  [
    "██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ██████╗ ███████╗",
    "██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝",
    "██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║██║  ██║█████╗  ",
    "██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║██║  ██║██╔══╝  ",
    "██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║██████╔╝███████╗",
    "╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝",
  ],
  [
    "██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ██████╗ ███████╗██████╗",
    "██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗",
    "██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║██║  ██║█████╗  ██████╔╝",
    "██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║██║  ██║██╔══╝  ██╔══██╗",
    "██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║██████╔╝███████╗██║  ██║",
    "╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝",
  ],
  ["", "", "", "", "", ""],
  ["", "", "", "", "", ""],
  [
    "██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ██████╗ ███████╗██████╗",
    "██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗",
    "██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║██║  ██║█████╗  ██████╔╝",
    "██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║██║  ██║██╔══╝  ██╔══██╗",
    "██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║██████╔╝███████╗██║  ██║",
    "╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝",
  ],
];

/**
 * Zeigt die Startanimation
 * @param screen Der blessed Screen
 * @returns Das erstellte AnimationBox Element
 */
export async function showStartAnimation(screen: blessed.Widgets.Screen): Promise<blessed.Widgets.BoxElement> {
  // Berechne die maximale Zeilenlänge für horizontale Zentrierung
  const maxLineLength = startAnimationFrames.reduce((max, frame) => {
    const frameMax = frame.reduce((m, line) => Math.max(m, line.length), 0);
    return Math.max(max, frameMax);
  }, 0);

  // Erstelle die Box für die Animation (ohne Border)
  const animationBox = blessed.box({
    top: 'center',
    left: 'center',
    width: maxLineLength + 1,
    height: startAnimationFrames[0].length + 3,
    tags: true,
    wrap: false,
    style: { bg: 'black' },
  });

  screen.append(animationBox);
  screen.render();

  // Definiere Start- und Endfarben
  const startColor = hexToRgb("#B2A4FF");
  const endColor = hexToRgb("#FFB4B4");

  // Animation: Frames anzeigen mit schrittweiser Beschleunigung
  let currentWait = 225;
  const accelerationFactor = 0.95; // kleiner = schneller

  for (const frame of startAnimationFrames) {
    const totalLines = frame.length;
    const coloredLines = frame.map((line, i) => {
      const color = interpolateColor(startColor, endColor, totalLines - 1, i);
      return colorText(line, color);
    });

    animationBox.setContent(coloredLines.join("\n"));
    screen.render();

    await wait(currentWait);
    currentWait *= accelerationFactor;
  }

  // Hinweistext hinzufügen, dass Enter gedrückt werden soll
  animationBox.setContent(
    animationBox.getContent() +
    "\n\n" +
    colorText("Drücke ENTER um fortzufahren...", startColor)
  );
  screen.render();

  // Warten, bis Enter gedrückt wird
  animationBox.focus();
  await new Promise<void>((resolve) => {
    screen.key(['enter'], () => {
      resolve();
    });
  });

  // AnimationBox ausblenden
  animationBox.hide();
  screen.render();
  return animationBox;
}
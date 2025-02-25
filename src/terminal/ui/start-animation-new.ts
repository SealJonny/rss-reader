import blessed from 'blessed';
import { wait, hexToRgb, interpolateColor, colorText } from '../../utils/animation-utils';

//
// Frames for the start animation
//
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
    // Variante 1: Mit screen.key()
    screen.key(['enter'], () => {
      resolve();
    });

    // Variante 2 (falls Variante 1 nicht funktioniert):
    // screen.once('keypress', (ch, key) => {
    //   if (key && key.name === 'enter') {
    //     resolve();
    //   }
    // });
  });

  // AnimationBox entfernen oder weiteren Code ausführen
  animationBox.hide();
  screen.render();
  return animationBox;
}

import blessed from 'more-blessed';
import { wait, hexToRgb, interpolateColor, colorText } from '../utils/animation-utils';
import insertJob from '../../../database/jobs/insert-job';

/**
 * ASCII art frames for the start animation
 * Each array element represents a frame,
 * and each frame contains an array of strings for each line
 */
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
];

/**
 * Displays the start animation with ASCII art
 * 
 * @param screen The blessed screen instance
 * @param bindToInsertJob Whether to bind the animation completion to the insert job completion
 * @returns Promise resolving to the created animation box element
 */
export async function showStartAnimation(screen: blessed.Widgets.Screen, bindToInsertJob: boolean = false): Promise<blessed.Widgets.BoxElement> {
  // Calculate the maximum line length for horizontal centering
  const maxLineLength = startAnimationFrames.reduce((max, frame) => {
    const frameMax = frame.reduce((m, line) => Math.max(m, line.length), 0);
    return Math.max(max, frameMax);
  }, 0);

  // Create the box for the animation (without border)
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

  // Define start and end colors for the animation
  const startColor = hexToRgb("#B2A4FF");
  const endColor = hexToRgb("#FFB4B4");

  // Animation: Display frames with gradual acceleration
  let currentWait = 225;
  const accelerationFactor = 0.95; // smaller = faster

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

  // Add hint text based on whether we're binding to the insert job
  animationBox.setContent(`${animationBox.getContent()}\n\n${bindToInsertJob ? colorText("Die Datenbank wird gerade gefüllt...", startColor) : colorText("Drücke ENTER um fortzufahren...", startColor)}`);

  screen.render();

  // Wait until Enter is pressed or the job completes
  animationBox.focus();
  await new Promise<void>((resolve) => {
    if (bindToInsertJob) {
      if (!insertJob.isActive()) {
        resolve();
      } else {
        insertJob.once("complete", resolve);
        insertJob.once("error", resolve);
      }
    } else {
      screen.key(['enter'], resolve);
    }
  });

  // Hide the animation box
  animationBox.hide();
  screen.render();
  return animationBox;
}

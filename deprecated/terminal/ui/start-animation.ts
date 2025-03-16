import blessed from 'blessed';
// import { feed } from '../feed';

//
// Types
//
interface RGB {
  r: number;
  g: number;
  b: number;
}



// Frames for the start animation
const startAnimationFrames: string[][] = [
    [
      "            ██████╗ ",
      "            ██╔══██╗",
      "            ██████╔╝",
      "            ██╔══██╗",
      "            ██║  ██║",
      "            ╚═╝  ╚═╝",
    ],
    [
      "            ██████╗ ███████╗",
      "            ██╔══██╗██╔════╝",
      "            ██████╔╝███████╗",
      "            ██╔══██╗╚════██║",
      "            ██║  ██║███████║",
      "            ╚═╝  ╚═╝╚══════╝",
    ],
    [
      "            ██████╗ ███████╗███████╗",
      "            ██╔══██╗██╔════╝██╔════╝",
      "            ██████╔╝███████╗███████╗",
      "            ██╔══██╗╚════██║╚════██║",
      "            ██║  ██║███████║███████║",
      "            ╚═╝  ╚═╝╚══════╝╚══════╝",
    ],
    [
      "            ██████╗ ███████╗███████╗    ██████╗ ",
      "            ██╔══██╗██╔════╝██╔════╝    ██╔══██╗",
      "            ██████╔╝███████╗███████╗    ██████╔╝",
      "            ██╔══██╗╚════██║╚════██║    ██╔══██╗",
      "            ██║  ██║███████║███████║    ██║  ██║",
      "            ╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝",
    ],
    [
      "            ██████╗ ███████╗███████╗    ██████╗ ███████╗",
      "            ██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝",
      "            ██████╔╝███████╗███████╗    ██████╔╝█████╗  ",
      "            ██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ",
      "            ██║  ██║███████║███████║    ██║  ██║███████╗",
      "            ╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝",
    ],
    [
      "            ██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ",
      "            ██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗",
      "            ██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║",
      "            ██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║",
      "            ██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║",
      "            ╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝",
    ],
    [
      "            ██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ██████╗ ",
      "            ██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔══██╗",
      "            ██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║██║  ██║",
      "            ██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║██║  ██║",
      "            ██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║██████╔╝",
      "            ╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ",
    ],
    [
      "            ██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ██████╗ ███████╗",
      "            ██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝",
      "            ██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║██║  ██║█████╗  ",
      "            ██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║██║  ██║██╔══╝  ",
      "            ██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║██████╔╝███████╗",
      "            ╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝",
    ],
    [
      "            ██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ██████╗ ███████╗██████╗",
      "            ██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗",
      "            ██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║██║  ██║█████╗  ██████╔╝",
      "            ██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║██║  ██║██╔══╝  ██╔══██╗",
      "            ██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║██████╔╝███████╗██║  ██║",
      "            ╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝",
    ],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    [
      "            ██████╗ ███████╗███████╗    ██████╗ ███████╗ █████╗ ██████╗ ███████╗██████╗",
      "            ██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗",
      "            ██████╔╝███████╗███████╗    ██████╔╝█████╗  ███████║██║  ██║█████╗  ██████╔╝",
      "            ██╔══██╗╚════██║╚════██║    ██╔══██╗██╔══╝  ██╔══██║██║  ██║██╔══╝  ██╔══██╗",
      "            ██║  ██║███████║███████║    ██║  ██║███████╗██║  ██║██████╔╝███████╗██║  ██║",
      "            ╚═╝  ╚═╝╚══════╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝",
    ],
];

//
// Helper functions
//
function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function hexToRgb(hex: string): RGB {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

function interpolateColor(
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

function colorText(text: string, color: RGB): string {
    return `\x1b[38;2;${color.r};${color.g};${color.b}m${text}\x1b[0m`;
}

//
// Define hex colors
//
const startColor = hexToRgb("#B2A4FF");
const endColor   = hexToRgb("#FFB4B4");

//
// Initiate blessed screen
//
const screen = blessed.screen({
    smartCSR: true,
    title: "Animate Logo with Blessed",
});

// Beenden per ESC / q / Ctrl-C
screen.key(["escape", "q", "C-c"], () => process.exit(0));

//
// Animation-Box
//
// 1) MaxLineLength for horizontal centering
let maxLineLength = 0;
for (const frame of startAnimationFrames) {
    for (const line of frame) {
        if (line.length > maxLineLength) {
        maxLineLength = line.length;
        }
    }
}

// 2) Box-Setup
const animationBox = blessed.box({
    top: 2,
    left: "center",
    width: maxLineLength,       // Platz für längste Frame-Zeile
    height: startAnimationFrames[0].length,   // Platz für Zeilen im ersten Frame
    tags: true,                 // ANSI-Codes erlauben
    wrap: false,                // keine automatischen Zeilenumbrüche
    style: {
        bg: "black",
    },
});

screen.append(animationBox);

//
// Menü-Box unten
//
const menuBox = blessed.box({
    bottom: 2,
    left: "center",
    width: 50,
    height: 9,
    tags: true,
    border: { type: "line" },
    style: { fg: "white", bg: "black" },
});
menuBox.hide(); // Erst nach der Animation zeigen
screen.append(menuBox);

//
// Animation starten
//
async function animateLogo() {
    let currentWait = 225;
    const accelerationFactor = 0.95; // smaller = faster

    for (const frame of startAnimationFrames) {
        const totalLines = frame.length;
        const lines: string[] = [];

        for (let i = 0; i < totalLines; i++) {
            const color = interpolateColor(startColor, endColor, totalLines - 1, i);
            const coloredLine = colorText(frame[i], color);
            lines.push(coloredLine);
        }

        animationBox.setContent(lines.join("\n"));
        screen.render();

        // Warte kurz, dann nächstes Frame
        await wait(currentWait);
        currentWait *= accelerationFactor;
    }

    // Nach der Animation: Menü anzeigen
    showMenu();
}

function showMenu() {
    menuBox.setContent(
        colorText(" (1) Test\n", endColor) +
        colorText(" (2) tseT\n", endColor) +
        colorText(" (3) Quit\n", endColor) +
        colorText("\n> ", endColor)
    );
    menuBox.show();
    screen.render();
    screen.key("1", () => loadFeed());
}

function loadFeed() {
    // feed(1);
}

//
// Hauptstart
//
animateLogo();
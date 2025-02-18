import blessed from 'blessed';
import { showStartAnimation } from './start-animation-new';
import { showRssFeedScreen } from './rss-feed-screen';
import { createHelpBox } from './help-box'

export async function main() {
  // 1) Haupt-Screen erstellen
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: 'Rss-Feed-Reader',
  });

  // 2) Globale Keys für Beenden
  screen.key(['escape', 'q', 'C-c'], () => {
    process.exit(0);
  });

  // 3) Startanimation anzeigen
  await showStartAnimation(screen);


  // 4) Nach der Animation die RSS-Feeds-Box
  const helpBox = createHelpBox(screen);
  const rssFeed = await showRssFeedScreen(screen);
  rssFeed.focus()

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      // Beispiel: Einfach nach 2 Sekunden "fertig"
      resolve();
    }, 20000);
  });

  helpBox.hide();
  screen.render();
  console.log('Hilfe ausgeblendet');


  await new Promise<void>((resolve) => {
    setTimeout(() => {
      // Beispiel: Einfach nach 2 Sekunden "fertig"
      resolve();
    }, 2000);
  });

  // → An dieser Stelle könntest du später weitere "Screens" hinzupacken,
  //    oder ein Menü, oder was du möchtest.
}

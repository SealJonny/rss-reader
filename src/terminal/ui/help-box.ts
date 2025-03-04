import blessed from 'blessed';
type View = "main-screen" | "rss-feed" | "another-view";

export function createHelpBox(screen: blessed.Widgets.Screen, view: View) {
  // Eine Box in der rechten unteren Ecke
  const helpBox = blessed.box({
    bottom: 0,
    right: 0,
    width: 'shrink',
    height: 'shrink',
    style: { 
      bg: 'black',
      fg: 'white',
    },

    focusable: false,
    clickable: false,
    keyable: false,
    keys: false,
    
    content: 'Favorize (f), Next (down), Previous (up), Exit (q)',
  });

  if (view === "rss-feed") {
    helpBox.setContent('Favorize (f), Next (down), Previous (up), Back to main-screen (q)');
  } else if (view === "main-screen") {
    helpBox.setContent('Exit (ctrl + c; esc)');
  }

  // Dem Screen anhängen
  screen.append(helpBox);
  screen.render();

  // Falls du sie später ausblenden oder entfernen möchtest,
  // kannst du sie zurückgeben:
  return helpBox;
}

import blessed from 'blessed';

export function createHelpBox(screen: blessed.Widgets.Screen) {
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

    tags: true,
    content: 'Favorize (f), Next (down), Previous (up), Exit (q)',
  });

  // Dem Screen anhängen
  screen.append(helpBox);
  screen.render();

  // Falls du sie später ausblenden oder entfernen möchtest,
  // kannst du sie zurückgeben:
  return helpBox;
}

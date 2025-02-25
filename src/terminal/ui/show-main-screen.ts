import blessed from 'blessed';

let output: Number = 0;


export async function showMainScreen(screen: blessed.Widgets.Screen): Promise<Number> {
  const mainScreenBox = blessed.box({
    top: 'center',
    left: 'center',
    width: 'shrink',
    height: 'shrink',
    style: { bg: 'black' },
    keys: true,
    content: 'Show Start Animation (1), Show RSS Feed (2)',
  });


  screen.append(mainScreenBox);
  screen.render();
  mainScreenBox.focus();

  await new Promise<void>((resolve) => {
    mainScreenBox.key(['1'], () => {
        output = 1;
        resolve();
    });
    mainScreenBox.key(['2'], () => {
        output = 2;
        resolve();
    });
  });

  mainScreenBox.destroy();
  screen.render();
  
  return output;
}

import blessed from 'blessed';

export function getScreenWidth(screen: blessed.Widgets.Screen): number {
  return screen.width as number;
}
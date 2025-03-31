import blessed from "more-blessed"
import { RssFeed } from "../../../../../interfaces/rss-feed";
import { getScreenWidth } from "../../../utils/feed-utils";
import { FeedListState } from "./feeds-screen";
import { colors } from "../../../themes/default-theme";

/**
 * Renders the feed list with current selection
 * 
 * @param screen The blessed screen instance
 * @param feedList The list element that displays feeds
 * @param feeds Array of RSS feeds to display
 * @param state Current state of the feed list selection
 * @param detailsBox Optional box for displaying feed details
 * @param separator Optional separator line between list and details
 */
export function renderFeedList(
  screen: blessed.Widgets.Screen,
  feedList: blessed.Widgets.ListElement,
  feeds: RssFeed[],
  state: FeedListState,
  detailsBox?: blessed.Widgets.BoxElement,
  separator?: blessed.Widgets.LineElement
): void {
  if (feeds.length === 0) {
    feedList.setItems(['Keine RSS Feeds verfügbar.', '', 'Drücke "a" um manuell einen neuen RSS Feed hinzuzufügen.', '', 'Oder "c" um einen mit Hilfe von ChatGPT hinzuzufügen.']);
    feedList.select(1);

    // Hide details and separator when no feeds
    if (detailsBox) detailsBox.hide();
    if (separator) separator.hide();
    feedList.screen?.render();
    return;
  }

  const items: string[] = [];
  const cutLenght = ((getScreenWidth(screen)*0.25)-10);

  // Add items
  feeds.forEach((feed, index) => {
    let cuttedTitle = feed.title.length > cutLenght ? `${feed.title.substring(0, cutLenght)}...` : feed.title;
    items.push(cuttedTitle);
  });

  feedList.setItems(items);

  // Set the selected item (offset by 3 for the header)
  feedList.select(state.currentIndex);

  // Show details for currently selected feed
  if (detailsBox && separator && feeds.length > 0) {
    const selectedFeed = feeds[state.currentIndex];
    if (selectedFeed) {
      renderFeedDetails(detailsBox, selectedFeed);
      detailsBox.show();
      separator.show();
    } else {
      detailsBox.hide();
      separator.hide();
    }
  }

  feedList.screen?.render();
}

/**
 * Renders the feed details in the details box
 * 
 * @param detailsBox The box element for displaying feed details
 * @param feed The RSS feed to display details for
 */
function renderFeedDetails(
  detailsBox: blessed.Widgets.BoxElement,
  feed: RssFeed
): void {
  let content = '';

  // Show title as header
  content += `{bold}{${colors.secondary}-fg}${feed.title}{/${colors.secondary}-fg}{/bold}\n\n`;

  // Show feed details
  content += `{bold}{${colors.primary}-fg}URL:{/${colors.primary}-fg}{/bold} \n${feed.link}\n\n`;
  content += `{bold}{${colors.primary}-fg}Description:{/${colors.primary}-fg}{/bold} \n${feed.description}\n\n`;

  if (feed.language) {
    content += `{bold}{${colors.primary}-fg}Language:{/${colors.primary}-fg}{/bold} \n${feed.language}\n\n`;
  }

  if (feed.lastBuildDate) {
    const date = new Date(feed.lastBuildDate);
    content += `{bold}{${colors.primary}-fg}Last Build Date:{/${colors.primary}-fg}{/bold} \n${date.toLocaleString()}\n\n`;
  }

  detailsBox.setContent(content);
}
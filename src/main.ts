/**
 * Application entry point that initializes the terminal UI
 * and handles uncaught errors
 */
import { main } from './terminal/ui/ui-handler';

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

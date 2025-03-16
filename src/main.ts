import { main } from './terminal/ui/ui-handler';

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

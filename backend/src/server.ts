import dotenv from 'dotenv';
import { createServer } from './app';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

async function bootstrap() {
  const app = await createServer();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Tech Fest API listening on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});


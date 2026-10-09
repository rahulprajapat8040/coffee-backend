import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Coffee-Backend');
  const PORT = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
  logger.log(`Running on PORT ${PORT}`);
}
await bootstrap();

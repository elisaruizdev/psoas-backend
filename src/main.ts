import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { seedDemoData } from './seed/demo-seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS_ORIGINS admite varias URLs separadas por comas
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['https://psoas.vercel.app', 'http://localhost:4200'];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Solo en Docker: crea un usuario demo con datos de ejemplo
  if (process.env.DEMO_SEED === 'true') {
    await seedDemoData(app.get(DataSource));
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

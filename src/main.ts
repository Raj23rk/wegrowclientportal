import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Enable Gzip/Brotli response compression for ultra-fast payload delivery
  app.use(compression());

  // Increase payload size limits for image uploads (base64)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Global API prefix
  app.setGlobalPrefix('api');

  // Enable CORS for React frontend (Vite port 5173 or other ports)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true
  });

  // Global input validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`WeGrow B School NestJS Backend is running on: http://0.0.0.0:${port}/api`);
}

bootstrap();

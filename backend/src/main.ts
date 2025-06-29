import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for both HTTP and WebSocket
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Game Backend API')
    .setDescription(
      'API para el juego educativo tipo outdraw.ai con IA integrada',
    )
    .setVersion('1.0')
    .addTag('rooms', 'Gestión de salas de juego')
    .addTag('prompts', 'Consignas y categorías del juego')
    .addTag('ai', 'Integración con IA Gemini')
    .addTag('gemini', 'Endpoints legacy de IA')
    .addTag('health', 'Estado del servidor')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Game server running on http://localhost:${port}`);
  console.log(`🎮 WebSocket namespace: /game`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch(console.error);

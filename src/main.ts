import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RolesGuard } from './common/guards/roles.guard'; // Make sure the path is correct
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  // Create an instance of the NestJS application
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API documentation for TaskFlow Manager')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Setup Swagger at /api-docs

  app.useGlobalGuards(new RolesGuard(new Reflector())); // Ensures that all routes use the guard
  // Ensures that all routes use the guard

  // Alternatively, to use `RolesGuard` globally through DI (dependency injection), you can register it like this:
  // app.useGlobalGuards(RolesGuard);

  // Start the application on the specified port (defaults to 3000 if PORT is not defined)
  await app.listen(process.env.PORT || 3000);
}

bootstrap();

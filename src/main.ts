import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { mkdir } from 'fs/promises';
import { join } from 'path'; 
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  // Create uploads directory if it doesn't exist
  try {
    await mkdir(join(process.cwd(), 'uploads'), { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

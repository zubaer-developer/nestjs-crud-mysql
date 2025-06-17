import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { mkdir } from 'fs/promises';
import { join } from 'path'; 

async function bootstrap() {
  // Create uploads directory if it doesn't exist
  try {
    await mkdir(join(process.cwd(), 'uploads'), { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './auth/user.entity';
import { UserModule } from './user/user.module';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { UploadModule } from './upload/upload.module';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';
import { RegistrationModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }), 
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), 
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE as 'mysql' | 'postgres' | 'sqlite',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User],
      synchronize: true, // Development only, use migrations in production
    }), 
    UserModule, 
    UploadModule, 
    RegistrationModule, 
    MailModule 
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class AppModule {}

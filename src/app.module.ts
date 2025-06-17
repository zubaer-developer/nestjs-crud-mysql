import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { UploadModule } from './upload/upload.module';
import { MulterModule } from '@nestjs/platform-express/multer/multer.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'nestjs_database',
      entities: [User],
      synchronize: true, // Development only, use migrations in production
    }), UserModule, UploadModule 
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class AppModule {}

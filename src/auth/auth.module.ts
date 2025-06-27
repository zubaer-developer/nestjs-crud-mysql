import { Module } from '@nestjs/common';
import { RegistrationService } from './auth.service';
import { RegistrationController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}

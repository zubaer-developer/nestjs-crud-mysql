import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [RegistrationController],
  providers: [RegistrationService],
})
export class RegistrationModule {}
// This module handles user registration functionality.
// It imports the User entity and registers the RegistrationService and RegistrationController.
// The TypeOrmModule is used to interact with the database for user-related operations.
// The User entity is defined in user.entity.ts and represents the user table in the database.
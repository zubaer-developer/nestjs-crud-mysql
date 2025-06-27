import { Controller, Post, Body } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { RegistrationService } from './registration.service';
import { User } from './user.entity';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.registrationService.register(registerDto);
  }
}
// This controller handles user registration requests.
// It uses the RegistrationService to process the registration logic.
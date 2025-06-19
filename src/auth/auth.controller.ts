import { Controller, Post, Body } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { RegistrationService } from './auth.service';
import { User } from './user.entity';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return this.registrationService.register(registerDto);
  }
}

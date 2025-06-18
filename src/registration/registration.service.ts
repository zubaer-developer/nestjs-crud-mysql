import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.entity';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({
      where: [
        { email: registerDto.email },
        { username: registerDto.username },
      ],
    });
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    const newUser = this.userRepo.create(registerDto);
    return await this.userRepo.save(newUser);
  }
}

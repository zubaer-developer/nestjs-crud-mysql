import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.entity';
import * as argon2 from 'argon2';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {

    const hashedPassword = await argon2.hash(registerDto.password);
    const newUser = this.userRepo.create({ ...registerDto, password: hashedPassword });
    return await this.userRepo.save(newUser);
    
  }
}

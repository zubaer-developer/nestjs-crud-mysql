import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
  return await this.userRepository.findOneBy({ id });
}


  async update(id: number, updateUserDto: RegisterDto): Promise<User | null> {
    console.log('Received ID:', id);
    console.log('Received Update:', updateUserDto);
    await this.userRepository.update(id, updateUserDto);
    const updated = await this.userRepository.findOneBy({ id });
    console.log('After Update:', updated);
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}

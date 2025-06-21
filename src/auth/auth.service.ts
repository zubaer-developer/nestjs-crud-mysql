import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.entity';
import * as argon2 from 'argon2';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {

    const hashedPassword = await argon2.hash(registerDto.password);
    const newUser = this.userRepo.create({ ...registerDto, password: hashedPassword });
    const savedUser = await this.userRepo.save(newUser);
    await this.mailService.sendRegistrationConfirmation(savedUser.email, savedUser.username);
    return savedUser;
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found with this email');
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await this.userRepo.save(user);
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
    
    return { message: 'Please check your email, you will receive a password reset link' };
  }

  async resetPassword(token: string, newPassword: string) {
  const user = await this.userRepo.findOne({
    where: { resetToken: token }
  });

  if (!user) {
    throw new NotFoundException('Invalid or expired reset token');
  }
  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    throw new NotFoundException('Reset token has expired');
  }
  const hashedPassword = await argon2.hash(newPassword);
  user.password = hashedPassword;
  user.resetToken = '';
  user.resetTokenExpiry = new Date();
  
  await this.userRepo.save(user);

  return { message: 'Password has been reset successfully' };
  }
}

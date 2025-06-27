import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.entity';
import * as argon2 from 'argon2';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  // Registers a new user.
  async register(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await argon2.hash(registerDto.password);
    const newUser = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(newUser);
    await this.mailService.sendRegistrationConfirmation(
      savedUser.email,
      savedUser.username,
    );
    return savedUser;
  }

  // Logs in a user by verifying their email and password.
  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    // JWT টোকেন তৈরি
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  // Changes the user's password after verifying the current password.
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await argon2.verify(
      user.password,
      changePasswordDto.currentPassword,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const hashedPassword = await argon2.hash(changePasswordDto.newPassword);

    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.mailService.sendPasswordChangeNotification(user.email);

    return {
      message: 'Password has been changed successfully',
    };
  }

  // Initiates the password reset process by generating a reset token and
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found with this email');
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await this.userRepository.save(user);
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        'Please check your email, you will receive a password reset link',
    };
  }

  // Resets the user's password using the provided reset token and new password.
  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { resetToken: token },
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

    await this.userRepository.save(user);

    return { message: 'Password has been reset successfully' };
  }
}

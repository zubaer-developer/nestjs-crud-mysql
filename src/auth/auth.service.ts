import {
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Registers a new user.
   * @param registerDto - The registration data transfer object containing user details.
   * @returns The newly created user.
   */
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

  /**
   * Logs in a user by verifying their email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns A success message and user details if login is successful.
   * @throws UnauthorizedException if the email or password is invalid.
   */

  async login(email: string, password: string) {
    // find user by email
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

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  /**
   * Initiates the password reset process by generating a reset token and sending it to the user's email.
   * @param email - The user's email address.
   * @returns A message indicating that a password reset link has been sent.
   * @throws NotFoundException if no user is found with the provided email.
   */
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

  /**
   * Resets the user's password using the provided reset token and new password.
   * @param token - The reset token sent to the user's email.
   * @param newPassword - The new password to set for the user.
   * @returns A success message indicating that the password has been reset.
   * @throws NotFoundException if the reset token is invalid or expired.
   */
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

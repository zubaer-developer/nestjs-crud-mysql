// mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendRegistrationConfirmation(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Registration Confirmation',
      html: `
        <div>
          <h1>Welcome, ${name}!</h1>
          <p>Your Registration Completed</p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `http://your-frontend-url/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div>
          <h1>Password Reset</h1>
          <p>To reset your password click the link bello:</p>
          <a href="${resetLink}">Parrssward link</a>
          <p>It will expire after 1 hour</p>
        </div>
      `,
    });
  }

  async sendPasswordChangeNotification(email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2c3e50;">Password Changed Successfully</h2>
          <p>Your account password has been changed successfully.</p>
          <p>If you didn't make this change, please contact us immediately.</p>
          <br>
          <p>Best regards,</p>
          <p>Your Team</p>
        </div>
      `,
    });
  }
}

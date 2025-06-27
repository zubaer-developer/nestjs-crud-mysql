import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  readonly currentPassword: string;

  @IsString()
  @MinLength(6)
  readonly newPassword: string;
}

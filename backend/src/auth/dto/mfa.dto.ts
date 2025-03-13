import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class MfaVerifyDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Six-digit MFA verification code',
  })
  @IsNumberString({}, { message: 'Token must contain only numbers' })
  @Length(6, 6, { message: 'Token must be exactly 6 digits' })
  token: string;
}

export class MfaResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether MFA setup was successful',
  })
  success: boolean;

  @ApiProperty({
    example:
      'otpauth://totp/SecureHealthApp:user@example.com?secret=ABCDEFGHIJKLMNOP&issuer=SecureHealthApp',
    description: 'QR code URI for MFA setup',
    required: false,
  })
  otpAuthUrl?: string;

  @ApiProperty({
    example: 'ABCDEFGHIJKLMNOP',
    description: 'Secret key for MFA setup',
    required: false,
  })
  secret?: string;
}

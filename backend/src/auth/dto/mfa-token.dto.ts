import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class MfaTokenDto {
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
  @IsString()
  @IsNotEmpty({ message: 'MFA token is required' })
  @Length(6, 6, { message: 'MFA token must be 6 digits' })
  token: string;
}

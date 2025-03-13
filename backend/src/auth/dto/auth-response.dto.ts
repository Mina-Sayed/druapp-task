import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './register.dto';

export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the user',
  })
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.PATIENT,
    description: 'Role of the user',
  })
  role: UserRole;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'URL to the user profile image',
    required: false,
  })
  image?: string;

  @ApiProperty({
    example: true,
    description: 'Whether MFA is enabled for this user',
    required: false,
  })
  mfaEnabled: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: UserResponseDto;

  @ApiProperty({
    example: false,
    description: 'Whether MFA verification is required to complete login',
    required: false,
  })
  mfaRequired?: boolean;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'New JWT access token',
  })
  accessToken: string;
}

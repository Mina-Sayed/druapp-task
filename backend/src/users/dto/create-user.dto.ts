import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  Matches,
} from 'class-validator';
import { UserRole } from '../../auth/dto/register.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;
}

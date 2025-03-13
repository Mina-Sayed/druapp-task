import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto';
import { MfaResponseDto, MfaVerifyDto } from './dto/mfa.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Set OTP lib configuration
    authenticator.options = {
      digits: 6,
      step: 30,
    };
  }

  /**
   * Validate a user's credentials
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<{ success: boolean; message?: string; user?: any }> {
    console.log('AuthService.validateUser called with:', { email, password });
    
    const user = await this.usersService.findByEmail(email);
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    // If MFA is enabled, we'll need to verify the token
    if (user.mfaEnabled) {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          mfaEnabled: true,
        },
      };
    }

    // Return user without sensitive data
    const { password: _, mfaSecret: __, ...result } = user;
    return { success: true, user: result };
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create new user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      mfaEnabled: false,
    });

    // Generate tokens
    const tokens = this.getTokens(user.id, user.email, user.role);

    // Transform user object to match UserResponseDto
    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      image: user.image,
    };

    // Return auth response
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
    };
  }

  /**
   * Login a user
   */
  async login(user: any): Promise<AuthResponseDto> {
    // Check if MFA is required for this user
    const fullUser = await this.usersService.findByEmail(user.email);

    if (fullUser.mfaEnabled) {
      return {
        accessToken: null,
        refreshToken: null,
        user: {
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          role: fullUser.role,
          mfaEnabled: true,
          image: fullUser.image,
        },
        mfaRequired: true,
      };
    }

    // Generate tokens
    const tokens = this.getTokens(user.id, user.email, user.role);

    // Transform user object to match UserResponseDto
    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: fullUser.mfaEnabled,
      image: user.image,
    };

    // Return auth response
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
    };
  }

  /**
   * Refresh auth tokens
   */
  async refreshTokens(userId: string): Promise<{ accessToken: string }> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token only
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    return { accessToken };
  }

  /**
   * Setup MFA for a user
   */
  async setupMfa(userId: string): Promise<MfaResponseDto> {
    // Get user
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new secret
    const secret = authenticator.generateSecret();

    // Save secret temporarily (until verification)
    await this.usersService.setTempMfaSecret(userId, secret);

    // Generate QR code URL
    const appName = 'SecureHealthApp';
    const otpAuthUrl = authenticator.keyuri(user.email, appName, secret);

    return {
      success: true,
      otpAuthUrl,
      secret,
    };
  }

  /**
   * Verify MFA token during setup
   */
  async verifyMfaSetup(
    userId: string,
    token: string,
  ): Promise<{ success: boolean }> {
    // Get user
    const user = await this.usersService.findOne(userId);

    if (!user || !user.tempMfaSecret) {
      throw new UnauthorizedException('MFA setup not initiated');
    }

    // Verify token
    const isValid = authenticator.verify({
      token,
      secret: user.tempMfaSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid MFA token');
    }

    // Enable MFA and save secret permanently
    await this.usersService.enableMfa(userId, user.tempMfaSecret);

    return { success: true };
  }

  /**
   * Verify MFA token during login
   */
  async verifyMfaLogin(dto: MfaVerifyDto): Promise<AuthResponseDto> {
    // Get user
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException('MFA not enabled for this user');
    }

    // Verify token
    const isValid = authenticator.verify({
      token: dto.token,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid MFA token');
    }

    // Generate tokens
    const tokens = this.getTokens(user.id, user.email, user.role);

    // Transform user object to match UserResponseDto
    const userResponse: UserResponseDto = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      image: user.image,
    };

    // Return auth response
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
    };
  }

  /**
   * Disable MFA for a user
   */
  async disableMfa(
    userId: string,
    token: string,
  ): Promise<{ success: boolean }> {
    // Get user
    const user = await this.usersService.findOne(userId);

    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException('MFA not enabled for this user');
    }

    // Verify token
    const isValid = authenticator.verify({
      token,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid MFA token');
    }

    // Disable MFA
    await this.usersService.disableMfa(userId);

    return { success: true };
  }

  /**
   * Helper to generate JWT tokens
   */
  private getTokens(
    userId: string,
    email: string,
    role: string,
  ): { accessToken: string; refreshToken: string } {
    const [accessToken, refreshToken] = [
      this.jwtService.sign(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.sign(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ];

    return {
      accessToken,
      refreshToken,
    };
  }
}

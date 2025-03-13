import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  UnauthorizedException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MfaVerifyDto } from './dto/mfa.dto';
import {
  AuthResponseDto,
  RefreshTokenResponseDto,
  UserResponseDto,
} from './dto/auth-response.dto';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Req() req: Request & { user: UserResponseDto }, @Body() loginDto: any): Promise<AuthResponseDto> {
    console.log('Login endpoint called with body:', loginDto);
    console.log('User from request:', req.user);
    return this.authService.login(req.user);
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify MFA token during login' })
  @ApiResponse({
    status: 200,
    description: 'MFA verified successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyMfa(@Body() verifyDto: MfaVerifyDto): Promise<AuthResponseDto> {
    return this.authService.verifyMfaLogin(verifyDto);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: RefreshTokenResponseDto })
  async refreshToken(@Req() req: Request & { user: UserResponseDto }): Promise<RefreshTokenResponseDto> {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.refreshTokens(req.user['id']);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getProfile(@Req() req: Request & { user: UserResponseDto }): Promise<UserResponseDto> {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return req.user as UserResponseDto;
  }

  @Post('mfa/setup')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup MFA' })
  async setupMfa(@Req() req: Request & { user: UserResponseDto }) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.setupMfa(req.user['id']);
  }

  @Post('mfa/verify-setup')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify MFA setup' })
  async verifyMfaSetup(
    @Req() req: Request & { user: UserResponseDto },
    @Body() body: { token: string }
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.verifyMfaSetup(req.user['id'], body.token);
  }

  @Post('mfa/disable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA' })
  async disableMfa(
    @Req() req: Request & { user: UserResponseDto },
    @Body() body: { token: string }
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.disableMfa(req.user['id'], body.token);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout() {
    // JWT is stateless, but we could implement token blacklisting here with Redis
    return { success: true, message: 'Logged out successfully' };
  }
}

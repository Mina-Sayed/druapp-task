import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('LocalStrategy.validate called with:', { email, password });
    
    const result = await this.authService.validateUser(email, password);
    console.log('validateUser result:', result);

    if (!result.success) {
      throw new UnauthorizedException(result.message || 'Invalid credentials');
    }

    return result.user;
  }
}

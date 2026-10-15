import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'wegrow_default_jwt_secret'
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.email) {
      throw new UnauthorizedException();
    }
    return {
      email: payload.email,
      clientId: payload.clientId,
      role: payload.role,
      name: payload.name,
      title: payload.title
    };
  }
}

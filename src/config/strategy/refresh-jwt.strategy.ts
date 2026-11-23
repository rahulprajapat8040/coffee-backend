import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { IJwtPayload } from '../../lib/interfaces/auth.interface.js';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const token = req.headers['x-refresh-token'];
          if (typeof token !== 'string' || token === 'undefined' || token === 'null') {
            return null;
          }
          return token;
        },

        (req: Request): string | null => {
          const key = process.env.JWT_REFRESH_KEY;
          const token = key ? req.cookies?.[key] : undefined;
          if (typeof token !== 'string' || token === 'undefined' || token === 'null') {
            return null;
          }
          return token;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      ignoreExpiration: false,
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(req: Request, payload: IJwtPayload) {
    const headerToken = req.headers['x-refresh-token'];
    const key = process.env.JWT_REFRESH_KEY;
    const cookieToken = key ? req.cookies?.[key] : undefined;
    const refreshToken =
      typeof headerToken === 'string' ? headerToken : cookieToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}

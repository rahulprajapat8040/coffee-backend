import { Injectable } from '@nestjs/common';
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
        // 📱 Mobile → X-Refresh-Token header
        (req: Request): string | null => {
          const token = req.headers['x-refresh-token'];
          if (!token || token === 'undefined' || token === 'null') {
            return null;
          }
          return String(token);
        },

        // 🌐 Web → HttpOnly refreshToken cookie

        (req: Request): string | null => {
          const key = process.env.JWT_REFRESH_KEY!;
          const token = req?.cookies?.[key];
          if (!token || token === 'undefined' || token === 'null') {
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

  /**
   * passReqToCallback = true
   * so validate(req, payload)
   */
  validate(req: Request, payload: IJwtPayload) {
    const key = process.env.JWT_REFRESH_KEY!;
    const token = req?.cookies?.[key];
    const refreshToken = req.headers['x-refresh-token'] || token;
    return {
      ...payload,
      refreshToken, // internal use only
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/sequelize';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from '../../modules/database/models/index.js';
import { IAuthUser, IJwtPayload } from '../../lib/interfaces/auth.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@InjectModel(User) private readonly user: typeof User) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),

        (req: Request): string | null => {
          const key = process.env.JWT_ACCESS_KEY!;
          const token = req?.cookies?.[key];
          if (!token || token === 'undefined' || token === 'null') {
            return null;
          }
          return token;
        },
      ]),
      secretOrKey: String(process.env.JWT_ACCESS_SECRET!),
      ignoreExpiration: false,
    });
  }

  async validate(payload: IJwtPayload): Promise<IAuthUser> {
    const user = await this.user.findByPk(payload.userId, {
      attributes: ['id'],
    });

    if (!user) {
      throw new UnauthorizedException(
        'Current you can not access this resource',
      );
    }

    return {
      id: user.id,
      deviceId: payload.deviceId,
    };
  }
}

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException({
        error: 'INVALID_TOKEN',
        message: 'Access token is invalid',
      });
    }

    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException({
        error: 'TOKEN_EXPIRED',
        message: 'Access token is expired',
      });
    }
    if (isPublic && !user) {
      return null;
    }

    if (!isPublic && !user) {
      throw new UnauthorizedException({
        error: 'TOKEN_NOT_PROVIDED',
        message: 'Access token is not provided',
      });
    }

    // 🌍 Public routes → optional JWT
    // - valid token → user
    // - no token → null
    // - invalid token → block
    if (err) {
      throw err;
    }

    return user || null;
  }
}

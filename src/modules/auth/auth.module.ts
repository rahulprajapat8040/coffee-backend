import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { OTPService } from "./otp.service.js";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from '@nestjs/passport';
import { AuthController } from "./auth.controller.js";
import { JwtStrategy } from "../../config/strategy/jwt.strategy.js";
import { RefreshJwtStrategy } from "../../config/strategy/refresh-jwt.strategy.js";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OTPService,
    JwtService,
    JwtStrategy,
    RefreshJwtStrategy,
  ],
  exports: [PassportModule, JwtModule, JwtService],
})
export class AuthModule {}
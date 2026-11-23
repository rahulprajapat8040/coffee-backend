import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { LoginDTO, OTPReqDTO, SignupDTO } from "./dto/auth.dto.js";
import { ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../config/guards/jwt-auth.guard.js";
import { RefreshJwtGuard } from "../../config/guards/jwt-refresh.guard.js";
import { CurrentUser } from "../../config/decorators/current-user.decorator.js";
import type {
  IAuthUser,
  IJwtPayload,
} from "../../lib/interfaces/auth.interface.js";

@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  sendOTP(@Body() dto: OTPReqDTO) {
    return this.authService.sendOTP(dto);
  }

  @Post('signup')
  signup(@Body() dto: SignupDTO) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @UseGuards(RefreshJwtGuard)
  @Post("refresh-token")
  refreshToken(
    @CurrentUser() user: IJwtPayload & { refreshToken: string },
  ) {
    return this.authService.refreshTokens(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUser(@CurrentUser() user: IAuthUser) {
    return this.authService.getUser(user);
  }
}
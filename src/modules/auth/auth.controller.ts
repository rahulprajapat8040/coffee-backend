import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { LoginDTO, OTPReqDTO, SignupDTO } from "./dto/auth.dto.js";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOTP(@Body() dto: OTPReqDTO) {
    return this.authService.sendOTP(dto);
  }
  
  @Post('signup')
  async signup(@Body() dto: SignupDTO){
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDTO){
    return this.authService.login(dto);
  }
}
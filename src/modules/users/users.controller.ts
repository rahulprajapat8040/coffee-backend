import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CurrentUser } from '../../config/decorators/current-user.decorator.js';
import type { IAuthUser } from '../../lib/interfaces/auth.interface.js';
import { AddressDTO } from './dto/user.dto.js';
import { JwtAuthGuard } from '../../config/guards/jwt-auth.guard.js';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('home')
  getHomeData() {
    return this.userService.getHomeData();
  }

  @UseGuards(JwtAuthGuard)
  @Post('address')
  saveAddress(@CurrentUser() user: IAuthUser, @Body() dto: AddressDTO) {
    return this.userService.saveAddress(user, dto);
  }
}

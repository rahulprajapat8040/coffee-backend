import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CurrentUser } from '../../config/decorators/current-user.decorator.js';
import type { IAuthUser } from '../../lib/interfaces/auth.interface.js';
import { AddressDTO, UpdateProfileDTO } from './dto/user.dto.js';
import { JwtAuthGuard } from '../../config/guards/jwt-auth.guard.js';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CommonQueryDTO } from '../../lib/utils/dto/common-query.dto.js';

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(@CurrentUser() user: IAuthUser) {
    return this.userService.getMyProfile(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(
    @CurrentUser() user: IAuthUser,
    @Body() dto: UpdateProfileDTO,
  ) {
    return this.userService.updateMyProfile(user, dto);
  }

  @Get('home')
  getHomeData() {
    return this.userService.getHomeData();
  }

  @UseGuards(JwtAuthGuard)
  @Post('address')
  saveAddress(@CurrentUser() user: IAuthUser, @Body() dto: AddressDTO) {
    return this.userService.saveAddress(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('address')
  getMyAddresses(
    @CurrentUser() user: IAuthUser,
    @Query() query: CommonQueryDTO,
  ) {
    return this.userService.getMyAddresses(query, user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', description: 'Address id' })
  @Put('address/:id')
  updateAddress(@Param('id') id: string, @Body() dto: AddressDTO) {
    return this.userService.updateAddress(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'id', description: 'Address id' })
  @Patch('address/:id')
  markAddressDefault(@Param('id') id: string, @CurrentUser() user: IAuthUser) {
    return this.userService.markAddressDefault(user, id);
  }
}

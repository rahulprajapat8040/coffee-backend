import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CurrentUser } from '../../config/decorators/current-user.decorator.js';
import type { IAuthUser } from '../../lib/interfaces/auth.interface.js';
import { AddressDTO } from './dto/user.dto.js';
import { JwtAuthGuard } from '../../config/guards/jwt-auth.guard.js';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CommonQueryDTO } from '../../lib/utils/dto/common-query.dto.js';

@ApiBearerAuth('access-token')
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
}

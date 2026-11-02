import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from '../services/cart.service.js';
import { JwtAuthGuard } from '../../../config/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../config/decorators/current-user.decorator.js';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import { CartDTO } from '../dto/cart.dto.js';
import { CommonQueryDTO } from '../../../lib/utils/dto/common-query.dto.js';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addToCart(@CurrentUser() user: IAuthUser, @Body() dto: CartDTO) {
    return this.cartService.addToCart(user, dto);
  }

  @Get('my')
  getMyCartItems(
    @CurrentUser() user: IAuthUser,
    @Query() query: CommonQueryDTO,
  ) {
    return this.cartService.getMyCartItems(user, query);
  }
}

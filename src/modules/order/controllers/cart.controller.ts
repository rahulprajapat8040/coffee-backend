import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from '../services/cart.service.js';
import { JwtAuthGuard } from '../../../config/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../config/decorators/current-user.decorator.js';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import { CartDTO, QuantityDTO } from '../dto/cart.dto.js';
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

  @ApiParam({ name: 'id', description: 'id of the item' })
  @Patch(':id/quantity')
  updateQuantity(
    @CurrentUser() user: IAuthUser,
    @Param('id') id: string,
    @Body() dto: QuantityDTO,
  ) {
    return this.cartService.updateQuantity(user, id, dto);
  }

  @ApiParam({ name: 'id', description: 'id of the item' })
  @Delete(':id')
  deleteQuantity(@Param('id') id: string) {
    return this.cartService.deleteCartItem(id);
  }

  @Get('my')
  getMyCartItems(
    @CurrentUser() user: IAuthUser,
    @Query() query: CommonQueryDTO,
  ) {
    return this.cartService.getMyCartItems(user, query);
  }
}

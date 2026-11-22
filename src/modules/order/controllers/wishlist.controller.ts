import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from '../../../config/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../../config/guards/jwt-auth.guard.js';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import { WishlistService } from '../services/wishlist.service.js';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser() user: IAuthUser) {
    return this.wishlistService.getWishlist(user);
  }

  @ApiParam({ name: 'coffeeId', description: 'Coffee id' })
  @Post(':coffeeId')
  addToWishlist(
    @CurrentUser() user: IAuthUser,
    @Param('coffeeId') coffeeId: string,
  ) {
    return this.wishlistService.addToWishlist(user, coffeeId);
  }

  @ApiParam({ name: 'coffeeId', description: 'Coffee id' })
  @Delete(':coffeeId')
  removeFromWishlist(
    @CurrentUser() user: IAuthUser,
    @Param('coffeeId') coffeeId: string,
  ) {
    return this.wishlistService.removeFromWishlist(user, coffeeId);
  }
}

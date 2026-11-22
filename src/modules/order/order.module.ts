import { Module } from '@nestjs/common';
import { CartController } from './controllers/cart.controller.js';
import { CartService } from './services/cart.service.js';
import { OrderController } from './controllers/order.controller.js';
import { WishlistController } from './controllers/wishlist.controller.js';
import { OrderService } from './services/order.service.js';
import { WishlistService } from './services/wishlist.service.js';
import { RolesGuard } from '../../config/guards/roles.guard.js';

@Module({
  controllers: [CartController, OrderController, WishlistController],
  providers: [CartService, OrderService, WishlistService, RolesGuard],
})
export class OrderModule {}

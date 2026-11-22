import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../../config/decorators/current-user.decorator.js';
import { Roles } from '../../../config/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../../config/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../config/guards/roles.guard.js';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import { Role } from '../../../lib/utils/enums/enum.js';
import { CreateOrderDTO, UpdateOrderStatusDTO } from '../dto/order.dto.js';
import { OrderService } from '../services/order.service.js';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(@CurrentUser() user: IAuthUser, @Body() dto: CreateOrderDTO) {
    return this.orderService.createOrder(user, dto);
  }

  @Get('my')
  getMyOrders(@CurrentUser() user: IAuthUser) {
    return this.orderService.getMyOrders(user);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDTO,
  ) {
    return this.orderService.updateOrderStatus(id, dto);
  }
}

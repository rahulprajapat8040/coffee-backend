import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../../config/decorators/current-user.decorator.js';
import { Roles } from '../../../config/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../../config/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../config/guards/roles.guard.js';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import { Role } from '../../../lib/utils/enums/enum.js';
import {
  CreateOrderDTO,
  OrderQueryDTO,
  UpdateOrderStatusDTO,
} from '../dto/order.dto.js';
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

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  getOrders(@Query() query: OrderQueryDTO) {
    return this.orderService.getOrders(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  getOrderDetail(@Param('id') id: string) {
    return this.orderService.getOrderDetail(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDTO,
    @CurrentUser() user: IAuthUser,
  ) {
    return this.orderService.updateOrderStatus(id, dto, user.id);
  }
}

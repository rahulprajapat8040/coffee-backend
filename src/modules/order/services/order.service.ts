import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Address,
  Cart,
  Coffee,
  Order,
  OrderItem,
  Variant,
} from '../../database/models/index.js';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import { responseSender } from '../../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../../lib/utils/constant/response-message.constant.js';
import { OrderStatus, VariantStatus } from '../../../lib/utils/enums/enum.js';
import { CreateOrderDTO, UpdateOrderStatusDTO } from '../dto/order.dto.js';

@Injectable()
export class OrderService {
  private readonly deliveryFee = 1;
  private readonly serviceFee = 0.4;

  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(Cart) private readonly cartModel: typeof Cart,
    @InjectModel(Address) private readonly addressModel: typeof Address,
    private readonly sequelize: Sequelize,
  ) {}

  async createOrder(user: IAuthUser, dto: CreateOrderDTO) {
    const order = await this.sequelize.transaction(async (transaction) => {
      const address = await this.addressModel.findOne({
        where: { id: dto.addressId, userId: user.id },
        transaction,
      });
      if (!address) {
        throw new NotFoundException('Delivery address not found');
      }

      const cartItems = await this.cartModel.findAll({
        where: { userId: user.id },
        include: [Coffee, Variant],
        transaction,
        lock: { level: transaction.LOCK.UPDATE, of: Cart },
      });
      if (cartItems.length === 0) {
        throw new BadRequestException('Your cart is empty');
      }

      const items = cartItems.map((cartItem) => {
        const coffee = cartItem.coffee;
        const variant = cartItem.variant;
        if (
          !coffee ||
          !coffee.isActive ||
          !variant ||
          variant.status !== VariantStatus.AVAILABLE ||
          variant.coffeeId !== coffee.id
        ) {
          throw new BadRequestException(
            `${coffee?.name ?? 'A cart item'} is currently unavailable`,
          );
        }
        return {
          coffeeId: coffee.id,
          variantId: variant.id,
          name: coffee.name,
          size: variant.size,
          image: coffee.image ?? null,
          price: String(variant.price),
          quantity: cartItem.quantity,
        };
      });

      const subtotalCents = items.reduce(
        (sum, item) =>
          sum + Math.round(Number(item.price) * 100) * item.quantity,
        0,
      );
      const deliveryFeeCents = Math.round(this.deliveryFee * 100);
      const serviceFeeCents = Math.round(this.serviceFee * 100);
      const money = (cents: number) => (cents / 100).toFixed(2);
      const deliveryAddress = address.nickName
        ? `${address.nickName} - ${address.address}`
        : address.address;

      const createdOrder = await this.orderModel.create(
        {
          userId: user.id,
          deliveryAddress,
          note: dto.note?.trim() || null,
          subtotal: money(subtotalCents),
          deliveryFee: money(deliveryFeeCents),
          serviceFee: money(serviceFeeCents),
          total: money(subtotalCents + deliveryFeeCents + serviceFeeCents),
        },
        { transaction },
      );
      await this.orderItemModel.bulkCreate(
        items.map((item) => ({ ...item, orderId: createdOrder.id })),
        { transaction },
      );
      await createdOrder.reload({
        include: [{ model: OrderItem, as: 'items' }],
        transaction,
      });
      await this.cartModel.destroy({
        where: { userId: user.id },
        transaction,
      });
      return createdOrder;
    });

    return responseSender(
      RESPONSE_MESSAGE.DATA_CREATED,
      HttpStatus.CREATED,
      true,
      order,
    );
  }

  async getMyOrders(user: IAuthUser) {
    const orders = await this.orderModel.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: OrderItem, as: 'items' }],
    });
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      orders,
    );
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDTO) {
    const order = await this.orderModel.findByPk(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PREPARING]: [OrderStatus.ON_THE_WAY, OrderStatus.CANCELLED],
      [OrderStatus.ON_THE_WAY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };
    if (!allowedTransitions[order.status].includes(dto.status)) {
      throw new BadRequestException(
        `Order cannot move from ${order.status} to ${dto.status}`,
      );
    }

    await order.update({ status: dto.status });
    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      order,
    );
  }
}

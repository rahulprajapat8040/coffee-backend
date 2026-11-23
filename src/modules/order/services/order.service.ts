import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Address,
  Cart,
  Coffee,
  Offer,
  Order,
  OrderItem,
  OrderStatusHistory,
  User,
  Variant,
} from '../../database/models/index.js';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import {
  generatePagination,
  getPagination,
  responseSender,
} from '../../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../../lib/utils/constant/response-message.constant.js';
import {
  OfferTargetType,
  OrderStatus,
  VariantStatus,
} from '../../../lib/utils/enums/enum.js';
import {
  CreateOrderDTO,
  OrderQueryDTO,
  UpdateOrderStatusDTO,
} from '../dto/order.dto.js';

type PricingOffer = Pick<
  Offer,
  | 'id'
  | 'title'
  | 'targetType'
  | 'coffeeIds'
  | 'categoryIds'
  | 'discountPercentage'
>;

export function getBestOfferForCoffee(
  coffeeId: string,
  categoryId: string,
  offers: PricingOffer[],
) {
  return offers.reduce<PricingOffer | null>((best, offer) => {
    const applies =
      offer.targetType === OfferTargetType.ALL_PRODUCTS ||
      (offer.targetType === OfferTargetType.SELECTED_COFFEES &&
        offer.coffeeIds.includes(coffeeId)) ||
      (offer.targetType === OfferTargetType.SELECTED_CATEGORIES &&
        offer.categoryIds.includes(categoryId));
    if (
      !applies ||
      (best &&
        Number(best.discountPercentage) >= Number(offer.discountPercentage))
    ) {
      return best;
    }
    return offer;
  }, null);
}

export function getOfferDiscountCents(
  priceCents: number,
  discountPercentage?: number | string,
) {
  if (discountPercentage === undefined) return 0;
  const percentage = Math.min(100, Math.max(0, Number(discountPercentage)));
  return Math.min(priceCents, Math.round((priceCents * percentage) / 100));
}

@Injectable()
export class OrderService {
  private readonly deliveryFee = 1;
  private readonly serviceFee = 0.4;

  constructor(
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(Cart) private readonly cartModel: typeof Cart,
    @InjectModel(Address) private readonly addressModel: typeof Address,
    @InjectModel(Offer) private readonly offerModel: typeof Offer,
    @InjectModel(OrderStatusHistory)
    private readonly orderStatusModel: typeof OrderStatusHistory,
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

      const now = new Date();
      const offers = await this.offerModel.findAll({
        where: {
          isActive: true,
          startDate: { [Op.lte]: now },
          [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: now } }],
        },
        transaction,
      });

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
        const applicableOffer = getBestOfferForCoffee(
          coffee.id,
          coffee.categoryId,
          offers,
        );
        const originalPriceCents = Math.round(Number(variant.price) * 100);
        const discountCents = getOfferDiscountCents(
          originalPriceCents,
          applicableOffer?.discountPercentage,
        );
        return {
          coffeeId: coffee.id,
          variantId: variant.id,
          name: coffee.name,
          size: variant.size,
          image: coffee.image ?? null,
          price: ((originalPriceCents - discountCents) / 100).toFixed(2),
          originalPrice: (originalPriceCents / 100).toFixed(2),
          discountAmount: (discountCents / 100).toFixed(2),
          offerTitle: applicableOffer?.title ?? null,
          quantity: cartItem.quantity,
        };
      });

      const subtotalCents = items.reduce(
        (sum, item) =>
          sum + Math.round(Number(item.originalPrice) * 100) * item.quantity,
        0,
      );
      const discountTotalCents = items.reduce(
        (sum, item) =>
          sum + Math.round(Number(item.discountAmount) * 100) * item.quantity,
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
          deliveryAddressLabel: address.nickName || null,
          deliveryLatitude: address.latitude ?? null,
          deliveryLongitude: address.longitude ?? null,
          note: dto.note?.trim() || null,
          subtotal: money(subtotalCents),
          discountTotal: money(discountTotalCents),
          deliveryFee: money(deliveryFeeCents),
          serviceFee: money(serviceFeeCents),
          total: money(
            subtotalCents -
              discountTotalCents +
              deliveryFeeCents +
              serviceFeeCents,
          ),
        },
        { transaction },
      );
      await this.orderItemModel.bulkCreate(
        items.map((item) => ({ ...item, orderId: createdOrder.id })),
        { transaction },
      );
      await this.orderStatusModel.create(
        {
          orderId: createdOrder.id,
          status: OrderStatus.PREPARING,
          changedBy: user.id,
        },
        { transaction },
      );
      await createdOrder.reload({
        include: [
          { model: OrderItem, as: 'items' },
          { model: OrderStatusHistory, as: 'statusHistory' },
        ],
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
      include: [
        { model: OrderItem, as: 'items' },
        { model: OrderStatusHistory, as: 'statusHistory' },
      ],
    });
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      orders,
    );
  }

  async getOrders(query: OrderQueryDTO) {
    const { page, limit, offset } = getPagination(query);
    const result = await this.orderModel.findAndCountAll({
      where: query.status ? { status: query.status } : {},
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phoneNo'],
        },
        { model: OrderItem, as: 'items' },
      ],
      distinct: true,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      generatePagination(result, page, limit),
    );
  }

  async getOrderDetail(id: string) {
    const order = await this.orderModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phoneNo'],
        },
        { model: OrderItem, as: 'items' },
        {
          model: OrderStatusHistory,
          as: 'statusHistory',
          include: [
            {
              model: User,
              as: 'changedByUser',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
      order: [[{ model: OrderStatusHistory, as: 'statusHistory' }, 'createdAt', 'ASC']],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      order,
    );
  }

  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDTO,
    changedBy: string,
  ) {
    const order = await this.sequelize.transaction(async (transaction) => {
      const existingOrder = await this.orderModel.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!existingOrder) {
        throw new NotFoundException('Order not found');
      }

      const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PREPARING]: [
          OrderStatus.ON_THE_WAY,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.ON_THE_WAY]: [
          OrderStatus.COMPLETED,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.COMPLETED]: [],
        [OrderStatus.CANCELLED]: [],
      };
      if (!allowedTransitions[existingOrder.status].includes(dto.status)) {
        throw new BadRequestException(
          `Order cannot move from ${existingOrder.status} to ${dto.status}`,
        );
      }

      await existingOrder.update({ status: dto.status }, { transaction });
      await this.orderStatusModel.create(
        { orderId: existingOrder.id, status: dto.status, changedBy },
        { transaction },
      );
      return existingOrder.reload({
        include: [
          { model: OrderItem, as: 'items' },
          { model: OrderStatusHistory, as: 'statusHistory' },
        ],
        transaction,
      });
    });
    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      order,
    );
  }
}

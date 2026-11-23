import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  Address,
  Cart,
  Category,
  Coffee,
  DeviceInfo,
  Offer,
  Order,
  OrderItem,
  OrderStatusHistory,
  User,
  Variant,
  Wishlist,
} from '../database/models/index.js';
import { RESPONSE_MESSAGE } from '../../lib/utils/constant/response-message.constant.js';
import { OrderStatus } from '../../lib/utils/enums/enum.js';
import { responseSender } from '../../lib/utils/helper/function.helper.js';

interface DailyRevenueRow {
  date: string;
  revenue: string;
  orders: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(DeviceInfo) private readonly deviceModel: typeof DeviceInfo,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Coffee) private readonly coffeeModel: typeof Coffee,
    @InjectModel(Variant) private readonly variantModel: typeof Variant,
    @InjectModel(Cart) private readonly cartModel: typeof Cart,
    @InjectModel(Address) private readonly addressModel: typeof Address,
    @InjectModel(Wishlist) private readonly wishlistModel: typeof Wishlist,
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(OrderStatusHistory)
    private readonly orderStatusModel: typeof OrderStatusHistory,
    @InjectModel(Offer) private readonly offerModel: typeof Offer,
    private readonly sequelize: Sequelize,
  ) {}

  async getCards() {
    const [
      users,
      devices,
      categories,
      coffees,
      variants,
      carts,
      addresses,
      wishlists,
      orders,
      orderItems,
      orderStatuses,
      offers,
      openOrders,
      completedOrders,
      revenue,
    ] = await Promise.all([
      this.userModel.count(),
      this.deviceModel.count(),
      this.categoryModel.count(),
      this.coffeeModel.count(),
      this.variantModel.count(),
      this.cartModel.count(),
      this.addressModel.count(),
      this.wishlistModel.count(),
      this.orderModel.count(),
      this.orderItemModel.count(),
      this.orderStatusModel.count(),
      this.offerModel.count(),
      this.orderModel.count({
        where: {
          status: [OrderStatus.PREPARING, OrderStatus.ON_THE_WAY],
        },
      }),
      this.orderModel.count({ where: { status: OrderStatus.COMPLETED } }),
      this.orderModel.sum('total', {
        where: { status: OrderStatus.COMPLETED },
      }),
    ]);

    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      {
        counts: {
          users,
          devices,
          categories,
          coffees,
          variants,
          carts,
          addresses,
          wishlists,
          orders,
          orderItems,
          orderStatuses,
          offers,
        },
        openOrders,
        completedOrders,
        revenue: Number(revenue ?? 0),
      },
    );
  }

  async getAnalytics() {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const [revenueRows, orderStatuses, products, orders] = await Promise.all([
      this.sequelize.query<DailyRevenueRow>(
        `SELECT
           TO_CHAR(DATE_TRUNC('day', "created_at"), 'YYYY-MM-DD') AS date,
           COALESCE(SUM("total"), 0)::text AS revenue,
           COUNT(*)::text AS orders
         FROM "Order"
         WHERE "created_at" >= :startDate
           AND "deleted_at" IS NULL
           AND "status" = :completedStatus
         GROUP BY DATE_TRUNC('day', "created_at")
         ORDER BY DATE_TRUNC('day', "created_at") ASC`,
        {
          replacements: {
            startDate,
            completedStatus: OrderStatus.COMPLETED,
          },
          type: QueryTypes.SELECT,
        },
      ),
      Promise.all(
        Object.values(OrderStatus).map(async (status) => ({
          status,
          count: await this.orderModel.count({ where: { status } }),
        })),
      ),
      this.orderItemModel.findAll({
        attributes: [
          'name',
          [this.sequelize.fn('SUM', this.sequelize.col('quantity')), 'quantity'],
        ],
        include: [
          {
            model: Order,
            attributes: [],
            where: { status: OrderStatus.COMPLETED },
            required: true,
          },
        ],
        group: ['name'],
        order: [[this.sequelize.literal('"quantity"'), 'DESC']],
        limit: 5,
      }),
      this.orderModel.findAll({
        attributes: ['id', 'status', 'total', 'createdAt'],
        include: [{ model: User, attributes: ['name'] }],
        order: [['createdAt', 'DESC']],
        limit: 6,
      }),
    ]);

    const revenueByDate = new Map(
      revenueRows.map((row) => [
        row.date,
        { revenue: Number(row.revenue), orders: Number(row.orders) },
      ]),
    );
    const revenueTrend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(date.getUTCDate() + index);
      const key = date.toISOString().slice(0, 10);
      const values = revenueByDate.get(key);
      return {
        date: key,
        revenue: values?.revenue ?? 0,
        orders: values?.orders ?? 0,
      };
    });

    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      {
        revenueTrend,
        orderStatuses,
        topProducts: products.map((product) => ({
          name: product.name,
          quantity: Number(product.get('quantity')),
        })),
        recentOrders: orders.map((order) => ({
          id: order.id,
          status: order.status,
          total: Number(order.total),
          createdAt: order.createdAt,
          customerName: order.user?.name ?? 'Guest',
        })),
      },
    );
  }
}

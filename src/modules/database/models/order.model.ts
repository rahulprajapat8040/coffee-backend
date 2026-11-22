import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import type { NonAttribute } from 'sequelize';
import { MODEL_NAME } from '../../../lib/utils/constant/model-names.constant.js';
import { OrderStatus, PaymentMethod } from '../../../lib/utils/enums/enum.js';
import { OrderItem } from './order-item.model.js';
import { User } from './user.model.js';

@Table({ tableName: MODEL_NAME.ORDER, paranoid: true, timestamps: true })
export class Order extends Model<Order, Partial<Order>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @Column(DataType.TEXT)
  declare deliveryAddress: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare note: string | null;

  @Column(DataType.DECIMAL(10, 2))
  declare subtotal: string;

  @Column(DataType.DECIMAL(10, 2))
  declare deliveryFee: string;

  @Column(DataType.DECIMAL(10, 2))
  declare serviceFee: string;

  @Column(DataType.DECIMAL(10, 2))
  declare total: string;

  @Default(OrderStatus.PREPARING)
  @Column(DataType.ENUM(...Object.values(OrderStatus)))
  declare status: OrderStatus;

  @Default(PaymentMethod.CASH_ON_DELIVERY)
  @Column(DataType.ENUM(...Object.values(PaymentMethod)))
  declare paymentMethod: PaymentMethod;

  @BelongsTo(() => User)
  declare user: NonAttribute<User>;

  @HasMany(() => OrderItem)
  declare items: NonAttribute<OrderItem[]>;
}

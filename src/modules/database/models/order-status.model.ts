import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import type { NonAttribute } from 'sequelize';
import { MODEL_NAME } from '../../../lib/utils/constant/model-names.constant.js';
import { OrderStatus as OrderStatusEnum } from '../../../lib/utils/enums/enum.js';
import { Order } from './order.model.js';
import { User } from './user.model.js';

@Table({
  tableName: MODEL_NAME.ORDER_STATUS,
  timestamps: true,
  updatedAt: false,
})
export class OrderStatusHistory extends Model<
  OrderStatusHistory,
  Partial<OrderStatusHistory>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Order)
  @Column({ type: DataType.UUID, allowNull: false })
  declare orderId: string;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatusEnum)),
    allowNull: false,
  })
  declare status: OrderStatusEnum;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare changedBy: string | null;

  @BelongsTo(() => Order)
  declare order: NonAttribute<Order>;

  @BelongsTo(() => User, { as: 'changedByUser' })
  declare changedByUser: NonAttribute<User | null>;
}

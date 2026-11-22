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
import { Order } from './order.model.js';

@Table({ tableName: MODEL_NAME.ORDER_ITEM, timestamps: true })
export class OrderItem extends Model<OrderItem, Partial<OrderItem>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Order)
  @Column({ type: DataType.UUID, allowNull: false })
  declare orderId: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare coffeeId: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare variantId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare size: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare image: string | null;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare price: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare quantity: number;

  @BelongsTo(() => Order, { onDelete: 'CASCADE' })
  declare order: NonAttribute<Order>;
}

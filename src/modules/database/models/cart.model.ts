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
import { MODEL_NAME } from '../../../lib/utils/constant/model-names.constant.js';
import { Coffee } from './coffee.model.js';
import type { NonAttribute } from 'sequelize';
import { User } from './user.model.js';
import { Variant } from './variant.model.js';

@Table({ tableName: MODEL_NAME.CART, paranoid: true, timestamps: true })
export class Cart extends Model<Cart, Partial<Cart>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.INTEGER)
  declare quantity: number;

  @ForeignKey(() => Coffee)
  @Column(DataType.UUID)
  declare coffeeId: string;

  @ForeignKey(() => Variant)
  @Column(DataType.UUID)
  declare variantId: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => Coffee)
  declare coffee: NonAttribute<Coffee>;

  @BelongsTo(() => Variant)
  declare variant: Variant;

  @BelongsTo(() => User)
  declare user: NonAttribute<User>;
}

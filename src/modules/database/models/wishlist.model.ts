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
import { Coffee } from './coffee.model.js';
import { User } from './user.model.js';

@Table({ tableName: MODEL_NAME.WISH_LIST, paranoid: true, timestamps: true })
export class Wishlist extends Model<Wishlist, Partial<Wishlist>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @ForeignKey(() => Coffee)
  @Column(DataType.UUID)
  declare coffeeId: string;

  @BelongsTo(() => User)
  declare user: NonAttribute<User>;

  @BelongsTo(() => Coffee)
  declare coffee: NonAttribute<Coffee>;
}

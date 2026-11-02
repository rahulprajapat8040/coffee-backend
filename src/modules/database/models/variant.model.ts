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
import { VariantStatus } from '../../../lib/utils/enums/enum.js';
import { Coffee } from './coffee.model.js';
import type { NonAttribute } from 'sequelize';

@Table({ tableName: MODEL_NAME.VARIANT, paranoid: true, timestamps: true })
export class Variant extends Model<Variant, Partial<Variant>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare size: string;

  @Column(DataType.DECIMAL(10, 3))
  declare price: string;

  @Default(VariantStatus.AVAILABLE)
  @Column(DataType.ENUM(...Object.values(VariantStatus)))
  declare status: VariantStatus;

  @Default(0)
  @Column(DataType.INTEGER)
  declare popularity: number;

  @ForeignKey(() => Coffee)
  @Column(DataType.UUID)
  declare coffeeId: string;

  @BelongsTo(() => Coffee)
  declare coffee: NonAttribute<Coffee>;
}

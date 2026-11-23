import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { MODEL_NAME } from '../../../lib/utils/constant/model-names.constant.js';
import { OfferTargetType } from '../../../lib/utils/enums/enum.js';

@Table({ tableName: MODEL_NAME.OFFER, paranoid: true, timestamps: true })
export class Offer extends Model<Offer, Partial<Offer>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare image: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(OfferTargetType)),
    allowNull: false,
  })
  declare targetType: OfferTargetType;

  @Default([])
  @Column({ type: DataType.JSONB, allowNull: false })
  declare coffeeIds: string[];

  @Default([])
  @Column({ type: DataType.JSONB, allowNull: false })
  declare categoryIds: string[];

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  declare discountPercentage: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare startDate: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare endDate: Date | null;

  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare isActive: boolean;
}

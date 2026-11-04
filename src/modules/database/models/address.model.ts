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
import { User } from './user.model.js';
import type { NonAttribute } from 'sequelize';

@Table({ tableName: MODEL_NAME.Address, paranoid: true, timestamps: true })
export class Address extends Model<Address, Partial<Address>> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare nickName: string;

  @Column(DataType.STRING)
  declare address: string;

  @Column(DataType.FLOAT)
  declare latitude: number;

  @Column(DataType.FLOAT)
  declare longitude: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isDefault: boolean;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: NonAttribute<User>;
}

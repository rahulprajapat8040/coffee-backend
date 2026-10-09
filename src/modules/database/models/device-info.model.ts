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
import { MODEL_NAME } from '../../../utils/constant/model-names.constant.js';
import { DeviceType } from '../../../utils/enums/enum.js';
import { User } from './user.model.js';

@Table({ tableName: MODEL_NAME.DEVICE_INFO, paranoid: true, timestamps: true })
export class DeviceInfo extends Model<DeviceInfo, Partial<DeviceInfo>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare deviceId: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare deviceToken: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare otp: string;

  @Column({ type: DataType.ENUM(...Object.values(DeviceType)) })
  declare deviceType: DeviceType;

  @Column({ type: DataType.TEXT })
  declare refreshHash: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;
}

import {
  BeforeCreate,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { MODEL_NAME } from '../../../utils/constant/model-names.constant.js';
import { DeviceInfo } from './device-info.model.js';

@Table({ tableName: MODEL_NAME.USER, paranoid: true, timestamps: true })
export class User extends Model<User, Partial<User>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare firstName: string;

  @Column(DataType.STRING)
  declare lastName: string;

  @Column(DataType.STRING)
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare countryCode: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare phoneNo: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare profilePic: string;

  @Column({ type: DataType.INTEGER })
  declare userIdx: number;

  @HasMany(() => DeviceInfo)
  declare devices: DeviceInfo[];

  @BeforeCreate
  static async setindex(instance: User) {
    const maxindex = await User.max('userIdx');
    instance.userIdx = Number(maxindex || 0) + 1;
  }
}

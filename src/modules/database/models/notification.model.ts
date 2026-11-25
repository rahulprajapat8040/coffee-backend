import { AllowNull, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { NotificationType } from '../../../lib/utils/enums/enum.js';
import { User } from './user.model.js';
import { MODEL_NAME } from '../../../lib/utils/constant/model-names.constant.js';

@Table({ tableName: MODEL_NAME.NOTIFICATION, timestamps: true })
export class Notification extends Model<Notification, Partial<Notification>> {
  @Default(DataType.UUIDV4)
  @PrimaryKey
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare title: string;

  @Column(DataType.TEXT)
  declare body: string;

  @AllowNull
  @Column(DataType.JSONB)
  declare data: Record<string, string> | null;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isRead: boolean;

  @Column(DataType.ENUM(...Object.values(NotificationType)))
  declare notificationType: NotificationType;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;
}
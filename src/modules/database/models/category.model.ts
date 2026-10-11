import { Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { MODEL_NAME } from "../../../utils/constant/model-names.constant.js";
import { Coffee } from "./coffee.model.js";

@Table({ tableName: MODEL_NAME.CATEGORY, paranoid: true, timestamps: true })
export class Category extends Model<Category, Partial<Category>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare image: string;

  @HasMany(() => Coffee)
  declare coffees: Coffee[];
}
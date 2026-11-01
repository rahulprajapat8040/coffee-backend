import { BelongsTo, Column, DataType, Default, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { MODEL_NAME } from "../../../utils/constant/model-names.constant.js";
import { Category } from "./category.model.js";
import type { NonAttribute } from 'sequelize';
import { Variant } from "./variant.model.js";

@Table({ tableName: MODEL_NAME.COFFEE, timestamps: true, paranoid: true })
export class Coffee extends Model<Coffee, Partial<Coffee>> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column(DataType.STRING)
  declare image: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @ForeignKey(() => Category)
  @Column(DataType.UUID)
  declare categoryId: string;

  @BelongsTo(() => Category, { onDelete: 'CASCADE' })
  declare category: NonAttribute<Category>;

  @HasMany(() => Variant)
  declare variants: Variant[];
}
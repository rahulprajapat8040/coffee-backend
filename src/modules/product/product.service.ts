import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../database/models/category.model.js';
import { Coffee } from '../database/models/coffee.model.js';
import { CategoryDTO } from './dto/category.dto.js';
import {
  generatePagination,
  getPagination,
  responseSender,
} from '../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../lib/utils/constant/response-message.constant.js';
import { CommonQueryDTO } from '../../lib/utils/dto/common-query.dto.js';
import {
  CoffeeDTO,
  CoffeeStatusUpdateDTO,
  VariantStatusUpdateDTO,
} from './dto/coffee.dto.js';
import { CoffeeQueryDTO } from './dto/product-query.dto.js';
import { Variant } from '../database/models/variant.model.js';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Coffee) private readonly coffeeModel: typeof Coffee,
    @InjectModel(Variant) private readonly variantModel: typeof Variant,
  ) {}

  async createCategory(dto: CategoryDTO) {
    const res = await this.categoryModel.create({ ...dto });
    return responseSender(
      RESPONSE_MESSAGE.DATA_CREATED,
      HttpStatus.CREATED,
      true,
      res,
    );
  }

  async getAllCategories(query: CommonQueryDTO) {
    const { page, limit, offset } = getPagination(query);
    const res = await this.categoryModel.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    const response = generatePagination(res, page, limit);
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      response,
    );
  }

  async updateCategory(id: string, dto: CategoryDTO) {
    const res = await this.categoryModel.update(dto, { where: { id } });
    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      res,
    );
  }

  async deleteCategory(id: string) {
    const res = await this.categoryModel.destroy({ where: { id } });
    return responseSender(
      RESPONSE_MESSAGE.DATA_DELETED,
      HttpStatus.OK,
      true,
      res,
    );
  }

  async createCoffee(dto: CoffeeDTO) {
    const { variants, ...data } = dto;
    const res = await this.coffeeModel.create(data);
    await this.variantModel.bulkCreate(
      variants.map((i) => ({ ...i, coffeeId: res.id })),
    );
    return responseSender(
      RESPONSE_MESSAGE.DATA_CREATED,
      HttpStatus.CREATED,
      true,
      res,
    );
  }

  async getAllCoffees(query: CoffeeQueryDTO) {
    const { page, limit, offset } = getPagination(query);
    const where = query.categoryId ? { categoryId: query.categoryId } : {};
    const res = await this.coffeeModel.findAndCountAll({
      include: [
        { model: this.categoryModel, attributes: ['name'] },
        {
          model: this.variantModel,
          attributes: ['id', 'size', 'price', 'status'],
        },
      ],
      distinct: true,
      where,
      limit,
      offset,
      order: [
        ['createdAt', 'DESC'],
        [{ model: this.variantModel, as: 'variants' }, 'id', 'ASC'],
      ],
    });
    const response = generatePagination(res, page, limit);
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      response,
    );
  }

  async updateCoffee(id: string, dto: CoffeeDTO) {
    const { variants, ...data } = dto;
    const res = await this.coffeeModel.update(data, { where: { id } });
    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      res,
    );
  }

  async updateCoffeeStatus(id: string, dto: CoffeeStatusUpdateDTO) {
    const res = await this.coffeeModel.update(
      { isActive: dto.isActive },
      { where: { id } },
    );
    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      res,
    );
  }

  async deleteCoffee(id: string) {
    const res = await this.coffeeModel.destroy({ where: { id } });
    return responseSender(
      RESPONSE_MESSAGE.DATA_DELETED,
      HttpStatus.OK,
      true,
      res,
    );
  }

  async changeVariantStatus(id: string, dto: VariantStatusUpdateDTO) {
    const res = await this.variantModel.update(
      { status: dto.status },
      { where: { id } },
    );

    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      res,
    );
  }
}

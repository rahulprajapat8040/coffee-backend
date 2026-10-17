import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Category } from "../database/models/category.model.js";
import { Coffee } from "../database/models/coffee.model.js";
import { CategoryDTO } from "./dto/category.dto.js";
import { generatePagination, getPagination, responseSender } from "../../utils/helper/function.helper.js";
import { RESPONSE_MESSAGE } from "../../utils/constant/response-message.constant.js";
import { CommonQueryDTO } from "../../utils/dto/common-query.dto.js";
import { CoffeeDTO } from "./dto/coffee.dto.js";
import { CoffeeQueryDTO } from "./dto/product-query.dto.js";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Coffee) private readonly coffeeModel: typeof Coffee,
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

  async createCoffee(dto: CoffeeDTO) {
    const res = await this.coffeeModel.create(dto);
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
      include: [{ model: this.categoryModel, attributes: ['name'] }],
      where,
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
}
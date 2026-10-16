import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Category } from "../database/models/category.model.js";
import { responseSender } from "../../utils/helper/function.helper.js";
import { RESPONSE_MESSAGE } from "../../utils/constant/response-message.constant.js";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Category) private readonly categoryModel: typeof Category,
  ) {}

  async getHomeData() {
    const [categories] = await Promise.all([
      this.categoryModel.findAll({ attributes: ['id', 'name'] }),
    ]);

    return responseSender(RESPONSE_MESSAGE.DATA_FETCHED, HttpStatus.OK, true, {
      categories,
    });
  }
}
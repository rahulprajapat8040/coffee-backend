import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../database/models/category.model.js';
import { responseSender } from '../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../lib/utils/constant/response-message.constant.js';
import { Address } from '../database/models/address.model.js';
import { User } from '../database/models/user.model.js';
import { IAuthUser } from '../../lib/interfaces/auth.interface.js';
import { AddressDTO } from './dto/user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Address) private readonly addressModel: typeof Address,
  ) {}

  async getHomeData() {
    const [categories] = await Promise.all([
      this.categoryModel.findAll({ attributes: ['id', 'name'] }),
    ]);

    return responseSender(RESPONSE_MESSAGE.DATA_FETCHED, HttpStatus.OK, true, {
      categories,
    });
  }

  async saveAddress(user: IAuthUser, dto: AddressDTO){
    const {address, latitude, longitude} = dto
    const res = await this.addressModel.create({
      address,
      latitude,
      longitude,
      userId: user.id,
    });

    return responseSender(
      RESPONSE_MESSAGE.DATA_CREATED,
      HttpStatus.CREATED,
      true,
      res,
    );
  }
}

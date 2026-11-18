import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../database/models/category.model.js';
import {
  generatePagination,
  getPagination,
  responseSender,
} from '../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../lib/utils/constant/response-message.constant.js';
import { Address } from '../database/models/address.model.js';
import { User } from '../database/models/user.model.js';
import { IAuthUser } from '../../lib/interfaces/auth.interface.js';
import { AddressDTO } from './dto/user.dto.js';
import { CommonQueryDTO } from '../../lib/utils/dto/common-query.dto.js';

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

  async saveAddress(user: IAuthUser, dto: AddressDTO) {
    const { nickName, address, latitude, longitude } = dto;
    const res = await this.addressModel.create({
      nickName,
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

  async getMyAddresses(query: CommonQueryDTO, user: IAuthUser) {
    const { page, limit, offset } = getPagination(query);
    const res = await this.addressModel.findAndCountAll({
      where: { userId: user.id },
      limit,
      offset,
      attributes: [
        'id',
        'nickName',
        'address',
        'latitude',
        'longitude',
        'isDefault',
        'createdAt',
      ],
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

  async updateAddress(id: string, dto: AddressDTO) {
    const { nickName, address, latitude, longitude } = dto;
    const res = await this.addressModel.update(
      {
        nickName,
        address,
        latitude,
        longitude,
      },
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

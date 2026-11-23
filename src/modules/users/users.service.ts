import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
import { AddressDTO, UpdateProfileDTO } from './dto/user.dto.js';
import { CommonQueryDTO } from '../../lib/utils/dto/common-query.dto.js';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Offer } from '../database/models/offer.model.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Address) private readonly addressModel: typeof Address,
    @InjectModel(Offer) private readonly offerModel: typeof Offer,
    private readonly sequelize: Sequelize,
  ) {}

  async getHomeData() {
    const now = new Date();
    const [categories, offers] = await Promise.all([
      this.categoryModel.findAll({ attributes: ['id', 'name'] }),
      this.offerModel.findAll({
        where: {
          isActive: true,
          startDate: { [Op.lte]: now },
          [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: now } }],
        },
        order: [['startDate', 'ASC']],
      }),
    ]);

    return responseSender(RESPONSE_MESSAGE.DATA_FETCHED, HttpStatus.OK, true, {
      categories,
      offers,
    });
  }

  async getMyProfile(user: IAuthUser) {
    const profile = await this.userModel.findByPk(user.id, {
      attributes: [
        'id',
        'name',
        'email',
        'countryCode',
        'phoneNo',
        'profilePic',
        'role',
      ],
    });
    if (!profile) {
      throw new NotFoundException(RESPONSE_MESSAGE.ACCOUNT_NOT_FOUND);
    }
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      profile,
    );
  }

  async updateMyProfile(user: IAuthUser, dto: UpdateProfileDTO) {
    const profile = await this.userModel.findByPk(user.id);
    if (!profile) {
      throw new NotFoundException(RESPONSE_MESSAGE.ACCOUNT_NOT_FOUND);
    }
    await profile.update(dto);
    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      profile,
    );
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

  async markAddressDefault(user: IAuthUser, id: string) {
    const res = await this.sequelize.transaction(async (tx) => {
      // unset all default addresses of this user
      await this.addressModel.update(
        { isDefault: false },
        {
          where: { userId: user.id },
          transaction: tx,
        },
      );

      // set the address as default
      const [updatedCount] = await this.addressModel.update(
        { isDefault: true },
        {
          where: {
            id,
            userId: user.id,
          },
          transaction: tx,
        },
      );

      if (updatedCount === 0) {
        throw new NotFoundException('Address not found');
      }

      return true;
    });

    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      res,
    );
  }
}

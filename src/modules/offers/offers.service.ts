import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Offer } from '../database/models/offer.model.js';
import { Coffee } from '../database/models/coffee.model.js';
import { Category } from '../database/models/category.model.js';
import {
  generatePagination,
  getPagination,
  responseSender,
} from '../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../lib/utils/constant/response-message.constant.js';
import { OfferTargetType } from '../../lib/utils/enums/enum.js';
import { OfferDTO, OfferQueryDTO } from './dto/offer.dto.js';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer) private readonly offerModel: typeof Offer,
    @InjectModel(Coffee) private readonly coffeeModel: typeof Coffee,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
  ) {}

  async create(dto: OfferDTO) {
    await this.validateOffer(dto);
    const offer = await this.offerModel.create(this.toOfferValues(dto));
    return responseSender(
      RESPONSE_MESSAGE.DATA_CREATED,
      HttpStatus.CREATED,
      true,
      offer,
    );
  }

  async getAll(query: OfferQueryDTO) {
    const { page, limit, offset } = getPagination(query);
    const where = query.search
      ? { title: { [Op.iLike]: `%${query.search.trim()}%` } }
      : {};
    const result = await this.offerModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      generatePagination(result, page, limit),
    );
  }

  async update(id: string, dto: OfferDTO) {
    const offer = await this.offerModel.findByPk(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    await this.validateOffer(dto);
    await offer.update(this.toOfferValues(dto));
    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      offer,
    );
  }

  async updateStatus(id: string, isActive: boolean) {
    const offer = await this.offerModel.findByPk(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    await offer.update({ isActive });
    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      offer,
    );
  }

  async delete(id: string) {
    const deleted = await this.offerModel.destroy({ where: { id } });
    if (!deleted) {
      throw new NotFoundException('Offer not found');
    }
    return responseSender(
      RESPONSE_MESSAGE.DATA_DELETED,
      HttpStatus.OK,
      true,
      null,
    );
  }

  private toOfferValues(dto: OfferDTO) {
    return {
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      image: dto.image?.trim() || null,
      targetType: dto.targetType,
      coffeeIds: [...new Set(dto.coffeeIds ?? [])],
      categoryIds: [...new Set(dto.categoryIds ?? [])],
      discountPercentage: dto.discountPercentage.toFixed(2),
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    };
  }

  private async validateOffer(dto: OfferDTO) {
    if (dto.endDate && new Date(dto.endDate) <= new Date(dto.startDate)) {
      throw new BadRequestException('End date must be after the start date');
    }

    const coffeeIds = [...new Set(dto.coffeeIds ?? [])];
    const categoryIds = [...new Set(dto.categoryIds ?? [])];
    if (dto.targetType === OfferTargetType.ALL_PRODUCTS) {
      if (coffeeIds.length || categoryIds.length) {
        throw new BadRequestException(
          'All-products offers cannot include product or category selections',
        );
      }
      return;
    }

    if (dto.targetType === OfferTargetType.SELECTED_COFFEES) {
      if (!coffeeIds.length || categoryIds.length) {
        throw new BadRequestException(
          'Select at least one coffee and no categories',
        );
      }
      const count = await this.coffeeModel.count({
        where: { id: { [Op.in]: coffeeIds } },
      });
      if (count !== coffeeIds.length) {
        throw new BadRequestException(
          'One or more selected coffees do not exist',
        );
      }
      return;
    }

    if (!categoryIds.length || coffeeIds.length) {
      throw new BadRequestException(
        'Select at least one category and no coffees',
      );
    }
    const count = await this.categoryModel.count({
      where: { id: { [Op.in]: categoryIds } },
    });
    if (count !== categoryIds.length) {
      throw new BadRequestException('One or more selected categories do not exist');
    }
  }
}

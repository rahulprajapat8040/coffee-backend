import { InjectModel } from '@nestjs/sequelize';
import { Cart, Coffee, Variant } from '../../database/models/index.js';
import { CartDTO, QuantityDTO } from '../dto/cart.dto.js';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CurrentUser } from '../../../config/decorators/current-user.decorator.js';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import {
  generatePagination,
  getPagination,
  responseSender,
} from '../../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../../lib/utils/constant/response-message.constant.js';
import { CommonQueryDTO } from '../../../lib/utils/dto/common-query.dto.js';
import { Op } from 'sequelize';

export class CartService {
  constructor(
    @InjectModel(Cart) private readonly cartModel: typeof Cart,
    @InjectModel(Coffee) private readonly coffeeModel: typeof Coffee,
    @InjectModel(Variant) private readonly variantModel: typeof Variant,
  ) {}

  async addToCart(@CurrentUser() user: IAuthUser, dto: CartDTO) {
    const { coffeeId, variantId, quantity } = dto;
    await this.validateItem(coffeeId, variantId);

    let res = await this.cartModel.findOne({
      where: { coffeeId, variantId, userId: user.id },
    });

    if (res) {
      await res.increment('quantity', { by: quantity });
    } else {
      res = await this.cartModel.create({
        coffeeId,
        variantId,
        quantity,
        userId: user.id,
      });
    }

    return responseSender(
      RESPONSE_MESSAGE.DATA_CREATED,
      HttpStatus.CREATED,
      true,
      res,
    );
  }

  async updateQuantity(user: IAuthUser, cartItemId: string, dto: QuantityDTO) {
    const by = dto.type === 'asc' ? dto.quantity : -dto.quantity;
    const where: any = {
      id: cartItemId,
      userId: user.id,
    };

    if (dto.type === 'desc') {
      where.quantity = {
        [Op.gte]: dto.quantity + 1,
      };
    }

    const res = await this.cartModel.increment('quantity', {
      by,
      where,
    });

    return responseSender(RESPONSE_MESSAGE.DATA_UPDATED, HttpStatus.OK, true, res);
  }

  async deleteCartItem(id: string){
    const res = await this.cartModel.destroy({ where: { id } });
    return responseSender(
      RESPONSE_MESSAGE.DATA_DELETED,
      HttpStatus.OK,
      true,
      res,
    );
  }

  async getMyCartItems(user: IAuthUser, query: CommonQueryDTO) {
    const { page, limit, offset } = getPagination(query);

    const carts = await this.cartModel.findAndCountAll({
      where: { userId: user.id },
      limit,
      offset,
    });

    const res = generatePagination(carts, page, limit);

    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      res,
    );
  }

  private async validateItem(coffeeId: string, variantId: string) {
    const variant = await this.variantModel.findByPk(variantId, {
      attributes: ['id', 'coffeeId'],
    });
    if (!variant) {
      throw new NotFoundException('This variant does not exist. Please check!');
    }
    if (variant.coffeeId !== coffeeId) {
      throw new BadRequestException(
        'This variant is related to another coffee. Please check!',
      );
    }
  }
}

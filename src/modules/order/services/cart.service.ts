import { InjectModel } from '@nestjs/sequelize';
import { Cart, Coffee, Variant } from '../../database/models/index.js';
import { CartDTO, QuantityDTO } from '../dto/cart.dto.js';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import { responseSender } from '../../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../../lib/utils/constant/response-message.constant.js';
import { VariantStatus } from '../../../lib/utils/enums/enum.js';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart) private readonly cartModel: typeof Cart,
    @InjectModel(Coffee) private readonly coffeeModel: typeof Coffee,
    @InjectModel(Variant) private readonly variantModel: typeof Variant,
  ) {}

  async addToCart(user: IAuthUser, dto: CartDTO) {
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
    const cart = await this.cartModel.findOne({
      where: { id: cartItemId, userId: user.id },
    });
    if (!cart) {
      throw new NotFoundException('Cart item not found');
    }

    const quantity =
      cart.quantity + (dto.type === 'asc' ? dto.quantity : -dto.quantity);
    if (quantity < 1) {
      throw new BadRequestException('Cart quantity must be at least one');
    }
    await cart.update({ quantity });

    return responseSender(
      RESPONSE_MESSAGE.DATA_UPDATED,
      HttpStatus.OK,
      true,
      cart,
    );
  }

  async deleteCartItem(user: IAuthUser, id: string) {
    const res = await this.cartModel.destroy({
      where: { id, userId: user.id },
    });
    return responseSender(
      RESPONSE_MESSAGE.DATA_DELETED,
      HttpStatus.OK,
      true,
      res,
    );
  }

  async getMyCartItems(user: IAuthUser) {
    const carts = await this.cartModel.findAll({
      where: { userId: user.id },
      include: [
        {
          model: this.coffeeModel,
          attributes: ['id', 'name', 'image', 'isActive'],
        },
        {
          model: this.variantModel,
          attributes: ['id', 'size', 'price', 'status', 'coffeeId'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      carts,
    );
  }

  private async validateItem(coffeeId: string, variantId: string) {
    const variant = await this.variantModel.findByPk(variantId, {
      attributes: ['id', 'coffeeId', 'status'],
    });
    if (!variant) {
      throw new NotFoundException('This variant does not exist. Please check!');
    }
    if (variant.coffeeId !== coffeeId) {
      throw new BadRequestException(
        'This variant is related to another coffee. Please check!',
      );
    }

    if (variant.status !== VariantStatus.AVAILABLE) {
      throw new BadRequestException('This size is currently unavailable');
    }

    const coffee = await this.coffeeModel.findByPk(coffeeId, {
      attributes: ['id', 'isActive'],
    });
    if (!coffee || !coffee.isActive) {
      throw new BadRequestException('This coffee is currently unavailable');
    }
  }
}

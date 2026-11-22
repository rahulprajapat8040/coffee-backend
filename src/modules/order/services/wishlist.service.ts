import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Coffee, Variant, Wishlist } from '../../database/models/index.js';
import type { IAuthUser } from '../../../lib/interfaces/auth.interface.js';
import { responseSender } from '../../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../../lib/utils/constant/response-message.constant.js';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist) private readonly wishlistModel: typeof Wishlist,
    @InjectModel(Coffee) private readonly coffeeModel: typeof Coffee,
  ) {}

  async getWishlist(user: IAuthUser) {
    const items = await this.wishlistModel.findAll({
      where: { userId: user.id },
      include: [
        {
          model: this.coffeeModel,
          include: [
            { model: Variant, attributes: ['id', 'size', 'price', 'status'] },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      items,
    );
  }

  async addToWishlist(user: IAuthUser, coffeeId: string) {
    const coffee = await this.coffeeModel.findByPk(coffeeId, {
      attributes: ['id'],
    });
    if (!coffee) {
      throw new NotFoundException('Coffee not found');
    }

    const [item] = await this.wishlistModel.findOrCreate({
      where: { userId: user.id, coffeeId },
      defaults: { userId: user.id, coffeeId },
    });
    return responseSender(
      RESPONSE_MESSAGE.DATA_CREATED,
      HttpStatus.CREATED,
      true,
      item,
    );
  }

  async removeFromWishlist(user: IAuthUser, coffeeId: string) {
    const deleted = await this.wishlistModel.destroy({
      where: { userId: user.id, coffeeId },
    });
    if (deleted === 0) {
      throw new NotFoundException('Wishlist item not found');
    }
    return responseSender(
      RESPONSE_MESSAGE.DATA_DELETED,
      HttpStatus.OK,
      true,
      deleted,
    );
  }
}

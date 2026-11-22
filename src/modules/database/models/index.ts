import { Address } from './address.model.js';
import { Cart } from './cart.model.js';
import { Category } from './category.model.js';
import { Coffee } from './coffee.model.js';
import { DeviceInfo } from './device-info.model.js';
import { User } from './user.model.js';
import { Variant } from './variant.model.js';
import { Wishlist } from './wishlist.model.js';
import { Order } from './order.model.js';
import { OrderItem } from './order-item.model.js';

export const models = [
  DeviceInfo,
  User,
  Category,
  Coffee,
  Variant,
  Cart,
  Address,
  Wishlist,
  Order,
  OrderItem,
];

export {
  User,
  DeviceInfo,
  Category,
  Coffee,
  Variant,
  Cart,
  Address,
  Wishlist,
  Order,
  OrderItem,
};

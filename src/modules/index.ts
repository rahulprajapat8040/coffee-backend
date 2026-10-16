import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { ProductModule } from './product/product.module.js';
import { RedisModule } from './redis/redis.module.js';
import { UsersModule } from './users/user.module.js';

export const Modules = [
  DatabaseModule,
  RedisModule,
  AuthModule,
  ProductModule,
  UsersModule,
];

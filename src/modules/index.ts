import { join } from 'path';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { FileModule } from './files/file.module.js';
import { ProductModule } from './product/product.module.js';
import { RedisModule } from './redis/redis.module.js';
import { UsersModule } from './users/user.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { OrderModule } from './order/order.module.js';

export const Modules = [
  ServeStaticModule.forRoot({
    rootPath: join(import.meta.dirname, '..', '..', 'uploads'),
    serveRoot: '/uploads',
  }),
  DatabaseModule,
  RedisModule,
  AuthModule,
  ProductModule,
  UsersModule,
  FileModule,
  OrderModule,
];

import { join } from 'path';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { FileModule } from './files/file.module.js';
import { ProductModule } from './product/product.module.js';
import { RedisModule } from './redis/redis.module.js';
import { UsersModule } from './users/user.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { OrderModule } from './order/order.module.js';
import { OffersModule } from './offers/offers.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { QueueModule } from './queue/queue.module.js';
import { NotificationModule } from './notifications/notification.module.js';

export const Modules = [
  ServeStaticModule.forRoot({
    rootPath: join(import.meta.dirname, '..', '..', 'uploads'),
    serveRoot: '/uploads',
  }),
  QueueModule,
  DatabaseModule,
  RedisModule,
  AuthModule,
  ProductModule,
  UsersModule,
  FileModule,
  OrderModule,
  OffersModule,
  DashboardModule,
  NotificationModule,
];

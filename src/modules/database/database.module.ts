import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { models } from './models/index.js';
import { DatabaseSyncService } from './database-sync.service.js';

@Global()
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      uri: process.env.DATABASE_URL,
      autoLoadModels: true,
      synchronize: false,
      logging: false,
      define: {
        underscored: true,
        freezeTableName: true,
      },
      models,
    }),
    SequelizeModule.forFeature(models),
  ],
  providers: [DatabaseSyncService],
  exports: [SequelizeModule],
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { RolesGuard } from '../../config/guards/roles.guard.js';
import { OffersController } from './offers.controller.js';
import { OffersService } from './offers.service.js';

@Module({
  controllers: [OffersController],
  providers: [OffersService, RolesGuard],
})
export class OffersModule {}

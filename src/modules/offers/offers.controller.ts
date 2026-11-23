import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../config/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../config/guards/roles.guard.js';
import { Roles } from '../../config/decorators/roles.decorator.js';
import { Role } from '../../lib/utils/enums/enum.js';
import { OfferDTO, OfferQueryDTO, OfferStatusDTO } from './dto/offer.dto.js';
import { OffersService } from './offers.service.js';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() dto: OfferDTO) {
    return this.offersService.create(dto);
  }

  @Get()
  getAll(@Query() query: OfferQueryDTO) {
    return this.offersService.getAll(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: OfferDTO) {
    return this.offersService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: OfferStatusDTO) {
    return this.offersService.updateStatus(id, dto.isActive);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.offersService.delete(id);
  }
}

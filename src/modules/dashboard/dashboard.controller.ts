import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../config/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../config/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../config/guards/roles.guard.js';
import { Role } from '../../lib/utils/enums/enum.js';
import { DashboardService } from './dashboard.service.js';

@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('cards')
  getCards() {
    return this.dashboardService.getCards();
  }

  @Get('analytics')
  getAnalytics() {
    return this.dashboardService.getAnalytics();
  }
}

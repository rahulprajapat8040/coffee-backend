import { Controller, Get } from "@nestjs/common";
import { UsersService } from "./users.service.js";

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('home')
  getHomeData() {
    return this.userService.getHomeData();
  }
}
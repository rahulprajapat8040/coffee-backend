import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service.js';
import { CategoryDTO } from './dto/category.dto.js';
import { CommonQueryDTO } from '../../lib/utils/dto/common-query.dto.js';
import {
  CoffeeDTO,
  CoffeeStatusUpdateDTO,
  VariantStatusUpdateDTO,
} from './dto/coffee.dto.js';
import { CoffeeQueryDTO } from './dto/product-query.dto.js';
import { ApiParam } from '@nestjs/swagger';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('category')
  createCategory(@Body() dto: CategoryDTO) {
    return this.productService.createCategory(dto);
  }

  @Get('category')
  getAllCategories(@Query() query: CommonQueryDTO) {
    return this.productService.getAllCategories(query);
  }

  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'category id', required: true })
  @Put('category/:id')
  updateCoffee(@Param('id') id: string, @Body() dto: CategoryDTO) {
    return this.productService.updateCategory(id, dto);
  }

  @ApiParam({ name: 'id', description: 'category id', required: true })
  @Delete('category/:id')
  deleteCoffee(@Param('id') id: string) {
    return this.productService.deleteCategory(id);
  }

  @Post('coffee')
  createCoffee(@Body() dto: CoffeeDTO) {
    return this.productService.createCoffee(dto);
  }

  @Get('coffee')
  getAllCoffees(@Query() query: CoffeeQueryDTO) {
    return this.productService.getAllCoffees(query);
  }

  @ApiParam({ name: 'id', description: 'coffee id uuid' })
  @Patch('coffee/:id/status')
  updateCoffeeStatus(
    @Param('id') id: string,
    @Body() dto: CoffeeStatusUpdateDTO,
  ) {
    return this.productService.updateCoffeeStatus(id, dto);
  }

  @ApiParam({ name: 'id', description: 'variant id uuid' })
  @Patch('coffee/variant/:id')
  changeVariantStatus(
    @Param('id') id: string,
    @Body() dto: VariantStatusUpdateDTO,
  ) {
    return this.productService.changeVariantStatus(id, dto);
  }
}
